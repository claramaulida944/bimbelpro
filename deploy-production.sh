#!/bin/bash

# Pastikan script dijalankan sebagai root/sudo
if [ "$EUID" -ne 0 ]; then
  echo "Silakan jalankan script ini menggunakan hak akses root (sudo)!"
  exit 1
fi

echo "===> Memulai Proses Deploy Nginx & SSL untuk bimbel.rinaradev.my.id <==="

# 1. Salin konfigurasi Nginx ke sites-available
echo "[1/6] Menyalin file konfigurasi Nginx..."
cp bimbel.rinaradev.my.id.conf /etc/nginx/sites-available/bimbel.rinaradev.my.id.conf

# 2. Buat symlink ke sites-enabled jika belum ada
echo "[2/6] Membuat symlink ke sites-enabled..."
ln -sf /etc/nginx/sites-available/bimbel.rinaradev.my.id.conf /etc/nginx/sites-enabled/

# 3. Hapus konfigurasi default Nginx agar tidak bentrok
echo "[3/6] Menghapus konfigurasi default..."
rm -f /etc/nginx/sites-enabled/default

# 4. Uji konfigurasi Nginx dan reload layanan
echo "[4/6] Menguji konfigurasi Nginx..."
if nginx -t; then
  echo "Konfigurasi Nginx valid. Melakukan reload..."
  systemctl reload nginx
else
  echo "Konfigurasi Nginx TIDAK VALID. Membatalkan reload!"
  exit 1
fi

# 5. Pasang SSL menggunakan Certbot Let's Encrypt secara non-interaktif
echo "[5/6] Menerbitkan SSL HTTPS menggunakan Certbot..."
if command -v certbot &> /dev/null; then
  certbot --nginx -d bimbel.rinaradev.my.id --non-interactive --agree-tos -m claramaulida94@gmail.com --redirect
else
  echo "Certbot tidak terinstall. Silakan install certbot terlebih dahulu!"
  exit 1
fi

# 6. Mengkonfigurasi port UFW Firewall
echo "[6/6] Membuka port firewall (UFW)..."
if command -v ufw &> /dev/null; then
  ufw allow 'Nginx Full'
  ufw allow OpenSSH
  ufw --force enable
  echo "Firewall berhasil dikonfigurasi."
else
  echo "UFW tidak terdeteksi. Silakan konfigurasi firewall manual."
fi

echo "===> Proses Deploy Sukses! Domain https://bimbel.rinaradev.my.id telah aktif <==="
