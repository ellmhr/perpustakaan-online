# 📚 Sistem Peminjaman Buku Perpustakaan Online - Bookridge

Web Application Deployment di Cloud menggunakan Railway (PaaS)

## 🎯 Deskripsi Proyek

Aplikasi web peminjaman buku perpustakaan berbasis online yang memungkinkan pengguna untuk:
- Registrasi dan login
- Mencari dan melihat koleksi buku
- Melakukan peminjaman buku secara online
- Memantau status peminjaman dan deadline
- Melihat denda keterlambatan

## 🛠️ Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- MySQL
- JWT (Authentication)
- bcryptjs (Password Hashing)

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome Icons

### Cloud Platform
- Railway (PaaS)
- MySQL Cloud Database

## 📁 Struktur Folder

```
perpustakaan-online/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── *.html
└── database/
    └── perpustakaan_cloud.sql
```

## 🚀 Cara Menjalankan Project

### 1. Setup Database

```sql
-- Import file SQL
mysql -u root -p < database/perpustakaan_cloud.sql
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit file .env sesuai konfigurasi database Anda
npm start
```

### 3. Setup Frontend

Buka file `frontend/index.html` di browser atau gunakan Live Server.

## 🔑 Fitur Utama

### User Features
- ✅ Registrasi & Login
- ✅ Pencarian buku
- ✅ Detail buku
- ✅ Peminjaman buku (deadline 7 hari otomatis)
- ✅ Status peminjaman aktif
- ✅ Riwayat peminjaman
- ✅ Informasi denda
- ✅ Profil user

## 📊 Alur Sistem

1. **User registrasi** → Data disimpan di database
2. **Login** → Mendapat JWT token
3. **Mencari buku** → Lihat koleksi buku
4. **Pinjam buku** → Status: Menunggu Pengambilan
5. **Ambil buku** → Status: Dipinjam (deadline +7 hari)
6. **Kembalikan buku** → Status: Dikembalikan / Terlambat
7. **Jika terlambat** → Denda Rp1.000/hari

## 🗄️ Database Schema

### Tabel Users
- id_user, nama, email, password, role, created_at

### Tabel Buku
- id_buku, judul, penulis, penerbit, tahun_terbit, stok

### Tabel Peminjaman
- id_peminjaman, id_user, id_buku, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, status

### Tabel Denda
- id_denda, id_peminjaman, jumlah_hari_terlambat, total_denda, status_bayar

## 🌐 Deployment ke Railway

1. Push code ke GitHub
2. Buat project di Railway.app
3. Connect repository
4. Set environment variables di Railway
5. Deploy backend
6. Deploy frontend (static site)

## 📝 API Endpoints

### Auth
- POST `/api/auth/register` - Registrasi user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get profile (protected)

### Books
- GET `/api/books` - Get all books
- GET `/api/books/popular` - Get popular books
- GET `/api/books/latest` - Get latest books
- GET `/api/books/search?q=` - Search books
- GET `/api/books/:id` - Get book detail

### Loans
- POST `/api/loans` - Create loan
- GET `/api/loans/my-loans` - Get active loans
- GET `/api/loans/history` - Get loan history
- GET `/api/loans/:id` - Get loan detail
- PUT `/api/loans/:id/return` - Return book

### Users
- GET `/api/users/profile` - Get profile
- PUT `/api/users/profile` - Update profile
- PUT `/api/users/change-password` - Change password
- GET `/api/users/stats` - Get user statistics

## 🔒 Keamanan

- Password di-hash menggunakan bcryptjs
- Authentication dengan JWT
- Protected routes dengan middleware
- HTTPS/SSL otomatis di Railway
- Input validation
- CORS enabled

## 👨‍💻 Developer

Developed for Cloud Computing Course Project

## 📄 License

ISC
