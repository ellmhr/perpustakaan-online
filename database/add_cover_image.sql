-- Migration: Add cover_image column to buku table

USE perpustakaan_cloud;

-- Add cover_image column
ALTER TABLE buku 
ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL AFTER stok;

-- Update some books with placeholder cover names (you'll upload actual files later)
UPDATE buku SET cover_image = 'laskar-pelangi.jpg' WHERE judul = 'Laskar Pelangi';
UPDATE buku SET cover_image = 'bumi-manusia.jpg' WHERE judul = 'Bumi Manusia';
UPDATE buku SET cover_image = 'cantik-itu-luka.jpg' WHERE judul = 'Cantik Itu Luka';
UPDATE buku SET cover_image = 'ronggeng-dukuh-paruk.jpg' WHERE judul = 'Ronggeng Dukuh Paruk';
UPDATE buku SET cover_image = 'perahu-kertas.jpg' WHERE judul = 'Perahu Kertas';
UPDATE buku SET cover_image = 'tenggelamnya-kapal-van-der-wijck.jpg' WHERE judul = 'Tenggelamnya Kapal Van Der Wijck';
UPDATE buku SET cover_image = 'negeri-5-menara.jpg' WHERE judul = 'Negeri 5 Menara';
UPDATE buku SET cover_image = 'hujan.jpg' WHERE judul = 'Hujan';
UPDATE buku SET cover_image = 'pulang.jpg' WHERE judul = 'Pulang';
UPDATE buku SET cover_image = 'dilan-1990.jpg' WHERE judul = 'Dilan 1990';
UPDATE buku SET cover_image = 'dear-nathan.jpg' WHERE judul = 'Dear Nathan';
UPDATE buku SET cover_image = 'filosofi-kopi.jpg' WHERE judul = 'Filosofi Kopi';
UPDATE buku SET cover_image = 'ayat-ayat-cinta.jpg' WHERE judul = 'Ayat-Ayat Cinta';
UPDATE buku SET cover_image = 'sang-pemimpi.jpg' WHERE judul = 'Sang Pemimpi';
UPDATE buku SET cover_image = 'edensor.jpg' WHERE judul = 'Edensor';

-- Verify changes
SELECT id_buku, judul, cover_image FROM buku;
