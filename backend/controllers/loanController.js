const db = require('../config/database');
const { calculateDeadline, calculateDaysLate, calculateFine } = require('../utils/helpers');

// Create loan (Pinjam buku)
exports.createLoan = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id_buku } = req.body;
    const id_user = req.user.id_user;

    // Validation
    if (!id_buku) {
      return res.status(400).json({
        success: false,
        message: 'ID buku harus diisi'
      });
    }

    await connection.beginTransaction();

    // Check book availability
    const [books] = await connection.query(
      'SELECT * FROM buku WHERE id_buku = ? AND stok > 0',
      [id_buku]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Buku tidak tersedia atau stok habis'
      });
    }

    // Check if user has active loan for this book
    const [activeLoan] = await connection.query(
      'SELECT * FROM peminjaman WHERE id_user = ? AND id_buku = ? AND status IN ("menunggu", "dipinjam")',
      [id_user, id_buku]
    );

    if (activeLoan.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memiliki peminjaman aktif untuk buku ini'
      });
    }

    // Create loan
    const tanggal_pinjam = new Date().toISOString().split('T')[0];
    const tanggal_jatuh_tempo = calculateDeadline(tanggal_pinjam);

    const [result] = await connection.query(
      'INSERT INTO peminjaman (id_user, id_buku, tanggal_pinjam, tanggal_jatuh_tempo, status) VALUES (?, ?, ?, ?, ?)',
      [id_user, id_buku, tanggal_pinjam, tanggal_jatuh_tempo, 'menunggu']
    );

    // Update book stock
    await connection.query(
      'UPDATE buku SET stok = stok - 1 WHERE id_buku = ?',
      [id_buku]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Peminjaman berhasil dibuat. Silakan ambil buku di perpustakaan.',
      data: {
        id_peminjaman: result.insertId,
        id_buku,
        tanggal_pinjam,
        tanggal_jatuh_tempo,
        status: 'menunggu'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  } finally {
    connection.release();
  }
};

// Get user's active loans
exports.getMyLoans = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const [loans] = await db.query(`
      SELECT 
        p.*,
        b.judul,
        b.penulis,
        b.penerbit,
        CASE 
          WHEN p.status = 'dipinjam' AND CURDATE() > p.tanggal_jatuh_tempo THEN 'terlambat'
          ELSE p.status
        END as current_status,
        CASE 
          WHEN p.status = 'dipinjam' AND CURDATE() > p.tanggal_jatuh_tempo 
          THEN DATEDIFF(CURDATE(), p.tanggal_jatuh_tempo)
          ELSE 0
        END as days_late
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.id_user = ? AND p.status IN ('menunggu', 'dipinjam')
      ORDER BY p.tanggal_pinjam DESC
    `, [id_user]);

    res.status(200).json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Get my loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get loan history
exports.getLoanHistory = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const [loans] = await db.query(`
      SELECT 
        p.*,
        b.judul,
        b.penulis,
        b.penerbit,
        d.total_denda,
        d.status_bayar
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      LEFT JOIN denda d ON p.id_peminjaman = d.id_peminjaman
      WHERE p.id_user = ? AND p.status IN ('dikembalikan', 'terlambat')
      ORDER BY p.tanggal_kembali DESC
    `, [id_user]);

    res.status(200).json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Get loan history error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Return book (Manual - dilakukan oleh admin/petugas perpustakaan)
// Endpoint ini untuk simulasi pengembalian buku
exports.returnBook = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id_peminjaman } = req.params;
    const id_user = req.user.id_user;

    await connection.beginTransaction();

    // Get loan data
    const [loans] = await connection.query(
      'SELECT * FROM peminjaman WHERE id_peminjaman = ? AND id_user = ?',
      [id_peminjaman, id_user]
    );

    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Data peminjaman tidak ditemukan'
      });
    }

    const loan = loans[0];

    if (loan.status === 'dikembalikan' || loan.status === 'terlambat') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Buku sudah dikembalikan'
      });
    }

    const tanggal_kembali = new Date().toISOString().split('T')[0];
    const daysLate = calculateDaysLate(loan.tanggal_jatuh_tempo, tanggal_kembali);
    const status = daysLate > 0 ? 'terlambat' : 'dikembalikan';

    // Update loan status
    await connection.query(
      'UPDATE peminjaman SET tanggal_kembali = ?, status = ? WHERE id_peminjaman = ?',
      [tanggal_kembali, status, id_peminjaman]
    );

    // Update book stock
    await connection.query(
      'UPDATE buku SET stok = stok + 1 WHERE id_buku = ?',
      [loan.id_buku]
    );

    // Create fine if late
    let fineData = null;
    if (daysLate > 0) {
      const totalFine = calculateFine(daysLate);
      const [fineResult] = await connection.query(
        'INSERT INTO denda (id_peminjaman, jumlah_hari_terlambat, total_denda, status_bayar) VALUES (?, ?, ?, ?)',
        [id_peminjaman, daysLate, totalFine, 'belum_bayar']
      );

      fineData = {
        id_denda: fineResult.insertId,
        jumlah_hari_terlambat: daysLate,
        total_denda: totalFine,
        status_bayar: 'belum_bayar'
      };
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: status === 'terlambat' ? 'Buku dikembalikan dengan keterlambatan' : 'Buku berhasil dikembalikan',
      data: {
        id_peminjaman,
        tanggal_kembali,
        status,
        denda: fineData
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  } finally {
    connection.release();
  }
};

// Get loan detail
exports.getLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    const [loans] = await db.query(`
      SELECT 
        p.*,
        b.judul,
        b.penulis,
        b.penerbit,
        b.tahun_terbit,
        u.nama as nama_peminjam,
        d.jumlah_hari_terlambat,
        d.total_denda,
        d.status_bayar
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      JOIN users u ON p.id_user = u.id_user
      LEFT JOIN denda d ON p.id_peminjaman = d.id_peminjaman
      WHERE p.id_peminjaman = ? AND p.id_user = ?
    `, [id, id_user]);

    if (loans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data peminjaman tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: loans[0]
    });
  } catch (error) {
    console.error('Get loan detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
