const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function tanya(pertanyaan) {
  return new Promise((resolve) => rl.question(pertanyaan, resolve));
}

// fungsi enkripsi n dekripsi

function bersihkanKey(key) {
  return key.toUpperCase().replace(/[^A-Z]/g, "");
}

function encrypt(plaintext, key) {
  const k = bersihkanKey(key);
  let hasil = "";
  let j = 0;

  for (const huruf of plaintext) {
    const atas = huruf.toUpperCase();
    if (atas >= "A" && atas <= "Z") {
      const basis = huruf === atas ? 65 : 97;
      const geser = k[j % k.length].charCodeAt(0) - 65;
      const kode = atas.charCodeAt(0) - 65;
      hasil += String.fromCharCode(((kode + geser) % 26) + basis);
      j++;
    } else {
      hasil += huruf;
    }
  }
  return hasil;
}

function decrypt(ciphertext, key) {
  const k = bersihkanKey(key);
  let hasil = "";
  let j = 0;

  for (const huruf of ciphertext) {
    const atas = huruf.toUpperCase();
    if (atas >= "A" && atas <= "Z") {
      const basis = huruf === atas ? 65 : 97;
      const geser = k[j % k.length].charCodeAt(0) - 65;
      const kode = atas.charCodeAt(0) - 65;
      hasil += String.fromCharCode(((kode - geser + 26) % 26) + basis);
      j++;
    } else {
      hasil += huruf;
    }
  }
  return hasil;
}

//fungsi validasi input

function validasi(teks, key) {
  if (!teks || teks.trim() === "") return "Error: Teks tidak boleh kosong.";
  if (!key || key.trim() === "") return "Error: Key tidak boleh kosong.";
  if (bersihkanKey(key).length === 0)
    return "Error: Key harus mengandung minimal satu huruf (A-Z).";
  return null; // null = tidak ada error
}

//test case

const testCases = [
  { plaintext: "HELLOWORLD", key: "KEY", expected: "RIJVSUYVJN" },
  { plaintext: "CRYPTOGRAPHY", key: "CIPHER", expected: "EZNWXFIZPWLP" },
  { plaintext: "GADJAHMADA", key: "UGM", expected: "AGPDGTGGPU" },
];

function jalankanTestCases() {
  console.log("\n=== TEST CASES ===");
  console.log(
    "Input".padEnd(14) +
      "Key".padEnd(9) +
      "Output".padEnd(15) +
      "Expected".padEnd(15) +
      "Status",
  );
  console.log("-".repeat(60));

  testCases.forEach((tc) => {
    const output = encrypt(tc.plaintext, tc.key);
    const status = output === tc.expected ? "PASS" : "FAIL";
    console.log(
      tc.plaintext.padEnd(14) +
        tc.key.padEnd(9) +
        output.padEnd(15) +
        tc.expected.padEnd(15) +
        status,
    );
  });
}

//security attack fiture idk

function demoKeyReuse(pesan1, pesan2, key) {
  const c1 = encrypt(pesan1, key);
  const c2 = encrypt(pesan2, key);

  console.log(`\nKey yang dipakai berulang: ${key}`);
  console.log(`Pesan 1 : ${pesan1}  ->  ${c1}`);
  console.log(`Pesan 2 : ${pesan2}  ->  ${c2}`);

  let posisiSama = [];
  const panjang = Math.min(c1.length, c2.length);
  for (let i = 0; i < panjang; i++) {
    if (/[A-Z]/i.test(c1[i]) && c1[i].toUpperCase() === c2[i].toUpperCase()) {
      posisiSama.push(i);
    }
  }

  console.log(`\nPosisi ciphertext yang identik: [${posisiSama.join(", ")}]`);
  if (posisiSama.length > 0) {
    console.log(
      `-> Ditemukan ${posisiSama.length} huruf ciphertext yang sama persis di posisi yang sama.\n` +
        `   Ini terjadi karena key yang sama dipakai untuk dua pesan berbeda -- penyerang bisa\n` +
        `   memanfaatkan pola berulang seperti ini untuk menebak panjang key (dasar Kasiski examination).`,
    );
  } else {
    console.log(
      "-> Tidak ada pola identik pada kombinasi pesan ini. Coba pesan yang mirip di awal.",
    );
  }
}

//menu web
async function tampilkanMenu() {
  console.log("\n=================================");
  console.log("Hai, ini hasil pecut claude");
  console.log("=================================");
  console.log("1. Enkripsi");
  console.log("2. Dekripsi");
  console.log("3. Jalankan Test Cases");
  console.log("4. Demo Key-Reuse (Security Feature)");
  console.log("5. Keluar");

  const pilihan = await tanya("Pilih menu (1-5): ");

  switch (pilihan.trim()) {
    case "1": {
      const plaintext = await tanya("Masukkan Plaintext: ");
      const key = await tanya("Masukkan Key: ");
      const errorMsg = validasi(plaintext, key);
      if (errorMsg) {
        console.log(errorMsg);
      } else {
        console.log(`\nCiphertext: ${encrypt(plaintext, key)}`);
      }
      break;
    }
    case "2": {
      const ciphertext = await tanya("Masukkan Ciphertext: ");
      const key = await tanya("Masukkan Key: ");
      const errorMsg = validasi(ciphertext, key);
      if (errorMsg) {
        console.log(errorMsg);
      } else {
        console.log(`\nPlaintext: ${decrypt(ciphertext, key)}`);
      }
      break;
    }
    case "3":
      jalankanTestCases();
      break;
    case "4": {
      const pesan1 = await tanya("Masukkan Pesan 1: ");
      const pesan2 = await tanya("Masukkan Pesan 2: ");
      const key = await tanya("Masukkan Key (dipakai untuk keduanya): ");
      const errorMsg = validasi(pesan1, key) || validasi(pesan2, key);
      if (errorMsg) {
        console.log(errorMsg);
      } else {
        demoKeyReuse(pesan1, pesan2, key);
      }
      break;
    }
    case "5":
      console.log("Sampai jumpa!");
      rl.close();
      return;
    default:
      console.log("Pilihan tidak valid, coba lagi.");
  }

  await tampilkanMenu();
}

tampilkanMenu();