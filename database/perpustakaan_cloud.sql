-- Create database
CREATE DATABASE IF NOT EXISTS perpustakaan_cloud;
USE perpustakaan_cloud;

-- Table: users
CREATE TABLE users (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: buku
CREATE TABLE buku (
  id_buku INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(200) NOT NULL,
  penulis VARCHAR(100) NOT NULL,
  penerbit VARCHAR(100),
  tahun_terbit YEAR,
  stok INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: peminjaman
CREATE TABLE peminjaman (
  id_peminjaman INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT NOT NULL,
  id_buku INT NOT NULL,
  tanggal_pinjam DATE NOT NULL,
  tanggal_jatuh_tempo DATE NOT NULL,
  tanggal_kembali DATE,
  status ENUM('menunggu', 'dipinjam', 'dikembalikan', 'terlambat') DEFAULT 'menunggu',
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_buku) REFERENCES buku(id_buku) ON DELETE CASCADE
);

-- Table: denda
CREATE TABLE denda (
  id_denda INT PRIMARY KEY AUTO_INCREMENT,
  id_peminjaman INT NOT NULL,
  jumlah_hari_terlambat INT NOT NULL,
  total_denda DECIMAL(10,2) NOT NULL,
  status_bayar ENUM('belum_bayar', 'sudah_bayar') DEFAULT 'belum_bayar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE
);

-- Sample data: buku
INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, stok) VALUES
('Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 5),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 3),
('Cantik Itu Luka', 'Eka Kurniawan', 'Gramedia Pustaka Utama', 2002, 4),
('Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Gramedia Pustaka Utama', 1982, 2),
('Perahu Kertas', 'Dee Lestari', 'Bentang Pustaka', 2009, 6),
('Tenggelamnya Kapal Van Der Wijck', 'Hamka', 'Bulan Bintang', 1938, 3),
('Negeri 5 Menara', 'Ahmad Fuadi', 'Gramedia Pustaka Utama', 2009, 5),
('Hujan', 'Tere Liye', 'Gramedia Pustaka Utama', 2016, 4),
('Pulang', 'Tere Liye', 'Republika', 2015, 3),
('Dilan 1990', 'Pidi Baiq', 'Pastel Books', 2014, 7),
('Dear Nathan', 'Erisca Febriani', 'Best Media', 2016, 4),
('Filosofi Kopi', 'Dee Lestari', 'Truedee Pustaka', 2006, 5),
('Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'Republika', 2004, 6),
('Sang Pemimpi', 'Andrea Hirata', 'Bentang Pustaka', 2006, 4),
('Edensor', 'Andrea Hirata', 'Bentang Pustaka', 2007, 3);

-- Sample data: users (password: password123 - hashed)
-- Password hash generated using bcrypt with 10 rounds
INSERT INTO users (nama, email, password, role) VALUES
('Admin Perpustakaan', 'admin@perpustakaan.com', '$2a$10$YourHashedPasswordHere', 'admin'),
('John Doe', 'john@email.com', '$2a$10$YourHashedPasswordHere', 'user'),
('Jane Smith', 'jane@email.com', '$2a$10$YourHashedPasswordHere', 'user');

-- Note: Password di atas adalah contoh. Untuk testing, gunakan password yang di-hash dari aplikasi
-- atau gunakan endpoint register untuk membuat user baru.
