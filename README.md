# Vigenère Cipher

Aplikasi praktikum berbahasa Indonesia untuk enkripsi, dekripsi, test cases, dan demonstrasi key reuse. HTML, CSS, dan JavaScript tanpa dependensi tambahan.

Jalankan dengan Node.js 18 atau lebih baru:

```sh
npm start
```

Buka http://localhost:3000. Port dapat diubah melalui `PORT`. Aplikasi juga dapat dibuka langsung dari `index.html`.

```sh
node fungsi.js  # Antarmuka terminal
npm test       # Delapan uji logika
```

- `fungsi.js`: algoritma dan data bersama untuk CLI dan browser.
- `app.js`: navigasi, form, validasi, dan penyajian hasil.
- `styles.css`: tampilan responsif, focus ring, serta reduced motion.
- `index.html`: halaman aplikasi.
- `IMPLEMENTATION.md`: keputusan desain, batasan sumber, dan bukti pemeriksaan anti-slop.

Semua perhitungan berjalan lokal. Input tidak disimpan setelah reload. Menu Keluar mengakhiri interaksi pada halaman tanpa menutup tab.

Pada menu **Test Cases**, isi Plaintext, Key, dan Expected Ciphertext, lalu pilih **Tambahkan & uji**. Hasil tambahan masuk ke tabel dan Test Summary bersama tiga uji bawaan. Perbandingan memperhatikan kapitalisasi, spasi, serta tanda baca. Test case tambahan tersimpan selama sesi halaman, termasuk saat berpindah menu, dan terhapus saat reload atau Keluar.
