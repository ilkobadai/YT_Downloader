# YouTube Downloader Web Version

Aplikasi web untuk mendownload video dari YouTube dengan interface yang modern dan mudah digunakan.

## Fitur

- 🎥 Download video YouTube dengan berbagai pilihan kualitas
- 🎵 Download audio-only (MP3)
- 📱 Responsive design untuk desktop dan mobile
- 📊 Progress tracking real-time
- 📝 Riwayat download
- 🎨 Modern UI dengan Tailwind CSS

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Library**: ytdl-core untuk YouTube download
- **Icons**: Font Awesome

## Instalasi

### Prerequisites
- Node.js (versi 14 atau lebih tinggi)
- npm atau yarn

### Langkah-langkah

1. Clone atau download repository ini
2. Masuk ke direktori proyek:
   ```bash
   cd web-youtube-downloader
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Jalankan server:
   ```bash
   npm start
   ```

5. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

## Penggunaan

1. Buka aplikasi di browser
2. Paste URL video YouTube yang ingin di-download
3. Klik tombol "Cari" untuk mengambil informasi video
4. Pilih kualitas video/audio yang diinginkan
5. Klik "Download" untuk memulai proses download
6. Tunggu hingga proses selesai
7. File akan otomatis di-download ke perangkat Anda

## API Endpoints

### GET /api/video-info
Mengambil informasi video YouTube

**Parameters:**
- `url` (string): URL video YouTube

**Response:**
```json
{
  "id": "videoId",
  "title": "Video Title",
  "duration": 123,
  "views": 1234567,
  "channel": "Channel Name",
  "thumbnail": "thumbnail_url",
  "formats": [
    {
      "itag": 22,
      "quality": "720p",
      "format": "mp4",
      "size": "45 MB"
    }
  ]
}
```

### GET /api/download
Mendownload video/audio

**Parameters:**
- `url` (string): URL video YouTube
- `itag` (string): Format itag yang dipilih

**Response:** File download

### GET /api/formats
Mendapatkan daftar format yang tersedia

**Parameters:**
- `url` (string): URL video YouTube

**Response:**
```json
{
  "video": [...],
  "audio": [...]
}
```

## Development

Untuk development mode dengan auto-reload:
```bash
npm run dev
```

## Struktur Proyek

```
web-youtube-downloader/
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript
├── server.js           # Backend Node.js
├── package.json        # Dependencies dan scripts
├── README.md          # Dokumentasi
└── downloads/         # Folder untuk file download (auto-created)
```

## Catatan

- Pastikan koneksi internet stabil
- Beberapa video mungkin memiliki batasan download
- Respek terhadap hak cipta dan gunakan dengan bijak
- Server akan membuat folder `downloads` untuk menyimpan file sementara

## Troubleshooting

### Common Issues

1. **"Failed to get video info"**
   - Pastikan URL YouTube valid
   - Cek koneksi internet
   - Video mungkin private atau telah dihapus

2. **"Download failed"**
   - Coba pilih format yang berbeda
   - Pastikan ada cukup ruang penyimpanan
   - Cek koneksi internet

3. **Server tidak bisa start**
   - Pastikan port 3000 tidak digunakan
   - Cek apakah Node.js sudah terinstall dengan benar

## License

MIT License - lihat file LICENSE untuk detail

## Disclaimer

Gunakan aplikasi ini dengan bertanggung jawab. Pengguna bertanggung jawab penuh terhadap konten yang di-download dan kepatuhan terhadap hak cipta.
