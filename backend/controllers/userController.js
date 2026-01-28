const db = require('../config/database');
const { hashPassword } = require('../utils/helpers');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const [users] = await db.query(
      'SELECT id_user, nama, email, role, created_at FROM users WHERE id_user = ?',
      [id_user]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { nama, email } = req.body;

    // Validation
    if (!nama || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan email harus diisi'
      });
    }

    // Check if email already used by another user
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? AND id_user != ?',
      [email, id_user]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan oleh user lain'
      });
    }

    // Update profile
    await db.query(
      'UPDATE users SET nama = ?, email = ? WHERE id_user = ?',
      [nama, email, id_user]
    );

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id_user,
        nama,
        email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { old_password, new_password } = req.body;

    // Validation
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru harus diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Get user data
    const [users] = await db.query(
      'SELECT password FROM users WHERE id_user = ?',
      [id_user]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify old password
    const { comparePassword } = require('../utils/helpers');
    const isValid = await comparePassword(old_password, users[0].password);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id_user = ?',
      [hashedPassword, id_user]
    );

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    // Count active loans
    const [activeLoans] = await db.query(
      'SELECT COUNT(*) as count FROM peminjaman WHERE id_user = ? AND status IN ("menunggu", "dipinjam")',
      [id_user]
    );

    // Count completed loans
    const [completedLoans] = await db.query(
      'SELECT COUNT(*) as count FROM peminjaman WHERE id_user = ? AND status = "dikembalikan"',
      [id_user]
    );

    // Count late returns
    const [lateLoans] = await db.query(
      'SELECT COUNT(*) as count FROM peminjaman WHERE id_user = ? AND status = "terlambat"',
      [id_user]
    );

    // Total fines
    const [fines] = await db.query(
      'SELECT COALESCE(SUM(d.total_denda), 0) as total FROM denda d JOIN peminjaman p ON d.id_peminjaman = p.id_peminjaman WHERE p.id_user = ? AND d.status_bayar = "belum_bayar"',
      [id_user]
    );

    res.status(200).json({
      success: true,
      data: {
        active_loans: activeLoans[0].count,
        completed_loans: completedLoans[0].count,
        late_returns: lateLoans[0].count,
        unpaid_fines: fines[0].total
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
