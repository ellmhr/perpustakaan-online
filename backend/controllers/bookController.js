const db = require('../config/database');

// Get all books with optional search and filter
exports.getAllBooks = async (req, res) => {
  try {
    const { search, penulis } = req.query;
    let query = 'SELECT * FROM buku WHERE stok > 0';
    const params = [];

    // Search by title
    if (search) {
      query += ' AND judul LIKE ?';
      params.push(`%${search}%`);
    }

    // Filter by author
    if (penulis) {
      query += ' AND penulis LIKE ?';
      params.push(`%${penulis}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [books] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await db.query(
      'SELECT * FROM buku WHERE id_buku = ?',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: books[0]
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get popular books (most borrowed)
exports.getPopularBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT b.*, COUNT(p.id_peminjaman) as total_pinjam
      FROM buku b
      LEFT JOIN peminjaman p ON b.id_buku = p.id_buku
      WHERE b.stok > 0
      GROUP BY b.id_buku
      ORDER BY total_pinjam DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Get popular books error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get latest books
exports.getLatestBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT * FROM buku 
      WHERE stok > 0
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Get latest books error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Search books (dedicated search endpoint)
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query pencarian tidak boleh kosong'
      });
    }

    const [books] = await db.query(`
      SELECT * FROM buku 
      WHERE (judul LIKE ? OR penulis LIKE ? OR penerbit LIKE ?)
      AND stok > 0
      ORDER BY judul ASC
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
      query: q
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Upload book cover
exports.uploadCover = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    // Update cover_image in database
    await db.query(
      'UPDATE buku SET cover_image = ? WHERE id_buku = ?',
      [req.file.filename, id]
    );

    res.status(200).json({
      success: true,
      message: 'Cover buku berhasil diupload',
      data: {
        filename: req.file.filename,
        path: `/uploads/covers/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
