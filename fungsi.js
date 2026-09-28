"use strict";

const isCLI = typeof module !== "undefined" && require.main === module;


/* =========================================================
   KONSTANTA
========================================================= */

const ALPHABET_SIZE = 26;
const MAX_VISUALIZATION_STEPS = 50;


/* =========================================================
   READLINE
========================================================= */

const rl = isCLI ? require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
}) : null;


function tanya(pertanyaan) {
    return new Promise((resolve) => {
        rl.question(pertanyaan, resolve);
    });
}


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/**
 * Mengecek apakah karakter merupakan huruf A-Z atau a-z.
 */
function isLetter(character) {
    return /^[A-Za-z]$/.test(character);
}


/**
 * Mengubah huruf menjadi angka 0-25.
 *
 * A = 0
 * B = 1
 * ...
 * Z = 25
 */
function charToNumber(character) {
    return character.toUpperCase().charCodeAt(0) - 65;
}


/**
 * Mengubah angka 0-25 kembali menjadi huruf.
 */
function numberToChar(value, lowercase = false) {

    const normalizedValue =
        ((value % ALPHABET_SIZE) + ALPHABET_SIZE) %
        ALPHABET_SIZE;

    const base = lowercase ? 97 : 65;

    return String.fromCharCode(
        normalizedValue + base
    );
}


/* =========================================================
   INPUT VALIDATION
========================================================= */

/**
 * Memvalidasi plaintext/ciphertext dan key.
 *
 * Key hanya boleh mengandung huruf A-Z.
 */
function validasi(teks, key) {

    if (!teks || teks.trim() === "") {
        return "Error: Teks tidak boleh kosong.";
    }

    if (!key || key.trim() === "") {
        return "Error: Key tidak boleh kosong.";
    }

    if (!/^[A-Za-z]+$/.test(key)) {
        return (
            "Error: Format key tidak valid.\n" +
            "Key hanya boleh mengandung huruf A-Z."
        );
    }

    return null;
}


/* =========================================================
   VIGENERE CIPHER
========================================================= */

/**
 * Fungsi inti Vigenère Cipher.
 *
 * mode:
 * - encrypt
 * - decrypt
 *
 * Repeating key otomatis diterapkan:
 *
 * Plaintext : ATTACKATDAWN
 * Key      : LEMON
 *
 * Key yang digunakan:
 * L E M O N L E M O N L E
 */
function processVigenere(text, key, mode) {

    const normalizedKey = key.toUpperCase();

    let result = "";
    let keyIndex = 0;

    const steps = [];


    for (let i = 0; i < text.length; i++) {

        const inputCharacter = text[i];


        /*
         * Karakter selain huruf tidak diproses.
         *
         * Contoh:
         * "HELLO 123!"
         *
         * spasi, angka, dan tanda baca
         * tetap dipertahankan.
         */
        if (!isLetter(inputCharacter)) {

            result += inputCharacter;

            steps.push({
                position: i + 1,
                input: inputCharacter,
                key: "-",
                inputValue: "-",
                shift: "-",
                output: inputCharacter,
                outputValue: "-",
                calculation: "Karakter tidak diproses",
            });

            continue;
        }


        /*
         * Repeating key.
         *
         * Jika key = KEY
         *
         * maka:
         *
         * K E Y K E Y K E Y ...
         */
        const keyCharacter =
            normalizedKey[
                keyIndex % normalizedKey.length
            ];


        const inputValue =
            charToNumber(inputCharacter);

        const shift =
            charToNumber(keyCharacter);


        let outputValue;


        if (mode === "encrypt") {

            /*
             * C = (P + K) mod 26
             */
            outputValue =
                (inputValue + shift) % ALPHABET_SIZE;

        } else {

            /*
             * P = (C - K + 26) mod 26
             */
            outputValue =
                (inputValue - shift + ALPHABET_SIZE) %
                ALPHABET_SIZE;
        }


        const outputCharacter =
            numberToChar(
                outputValue,
                inputCharacter ===
                inputCharacter.toLowerCase()
            );


        result += outputCharacter;


        let calculation;


        if (mode === "encrypt") {

            calculation =
                `${inputCharacter}(${inputValue}) + ` +
                `${keyCharacter}(${shift}) = ` +
                `${outputCharacter}(${outputValue}) mod 26`;

        } else {

            calculation =
                `${inputCharacter}(${inputValue}) - ` +
                `${keyCharacter}(${shift}) = ` +
                `${outputCharacter}(${outputValue}) mod 26`;
        }


        steps.push({
            position: i + 1,
            input: inputCharacter,
            key: keyCharacter,
            inputValue,
            shift,
            output: outputCharacter,
            outputValue,
            calculation,
        });


        /*
         * Key hanya maju jika karakter input
         * berupa huruf.
         */
        keyIndex++;
    }


    return {
        result,
        steps,
    };
}


/**
 * Fungsi enkripsi.
 */
function encrypt(plaintext, key) {

    return processVigenere(
        plaintext,
        key,
        "encrypt"
    );
}


/**
 * Fungsi dekripsi.
 */
function decrypt(ciphertext, key) {

    return processVigenere(
        ciphertext,
        key,
        "decrypt"
    );
}


/* =========================================================
   VISUALISASI ALGORITMA
========================================================= */

function tampilkanLangkah(steps) {

    console.log("\n============================================================");
    console.log("VISUALISASI LANGKAH ALGORITMA");
    console.log("============================================================");

    console.log("\nRumus:");

    console.log(
        "Enkripsi : C = (P + K) mod 26"
    );

    console.log(
        "Dekripsi : P = (C - K + 26) mod 26"
    );

    console.log(
        "\nPemetaan: A = 0, B = 1, ..., Z = 25\n"
    );


    console.log(
        "No.".padEnd(5) +
        "Input".padEnd(8) +
        "Key".padEnd(8) +
        "P/C".padEnd(8) +
        "Shift".padEnd(8) +
        "Output".padEnd(10)
    );


    console.log("-".repeat(47));


    const displayedSteps =
        steps.slice(
            0,
            MAX_VISUALIZATION_STEPS
        );


    displayedSteps.forEach((step) => {

        console.log(
            String(step.position).padEnd(5) +
            String(step.input).padEnd(8) +
            String(step.key).padEnd(8) +
            String(step.inputValue).padEnd(8) +
            String(step.shift).padEnd(8) +
            String(step.output).padEnd(10)
        );
    });


    if (steps.length > MAX_VISUALIZATION_STEPS) {

        console.log(
            `\n... hanya menampilkan ` +
            `${MAX_VISUALIZATION_STEPS} dari ` +
            `${steps.length} langkah.`
        );
    }


    console.log("\nDetail Perhitungan:");

    displayedSteps.forEach((step) => {

        console.log(
            `${step.position}. ${step.calculation}`
        );
    });
}


/* =========================================================
   TEST CASES
========================================================= */

/*
 * Test case dibuat berbeda dari contoh dasar dosen.
 *
 * Setiap test case memiliki:
 * - Plaintext
 * - Key
 * - Expected Ciphertext
 */
const TEST_CASES = [

    {
        plaintext: "DATASAINS",
        key: "UGM",
        expected: "XGFUYMCTE",
    },

    {
        plaintext: "KULIAH KRIPTO",
        key: "LOGIC",
        expected: "VIRQCS YXQREC",
    },

    {
        plaintext: "RAHASIA 2026!",
        key: "AI",
        expected: "RIHISQA 2026!",
    },
];


/**
 * Menjalankan semua test case.
 */
function jalankanTestCases() {

    console.log("\n============================================================");
    console.log("TEST CASES");
    console.log("============================================================\n");


    let passed = 0;
    let failed = 0;


    TEST_CASES.forEach((testCase, index) => {

        const output =
            encrypt(
                testCase.plaintext,
                testCase.key
            ).result;


        const status =
            output === testCase.expected
                ? "PASS"
                : "FAIL";


        if (status === "PASS") {
            passed++;
        } else {
            failed++;
        }


        console.log(
            `Test Case ${index + 1}`
        );

        console.log(
            `Plaintext           : ${testCase.plaintext}`
        );

        console.log(
            `Key                 : ${testCase.key}`
        );

        console.log(
            `Expected Ciphertext : ${testCase.expected}`
        );

        console.log(
            `Your Output         : ${output}`
        );

        console.log(
            `Status              : ${status}`
        );

        console.log("-".repeat(60));
    });


    console.log("\n============================================================");
    console.log("TEST SUMMARY");
    console.log("============================================================");

    console.log(
        `PASS : ${passed}`
    );

    console.log(
        `FAIL : ${failed}`
    );

    console.log(
        `TOTAL: ${TEST_CASES.length}`
    );
}


/* =========================================================
   SECURITY / ATTACK FEATURE
========================================================= */

/**
 * Menganalisis penggunaan key yang sama pada dua pesan.
 *
 * Tujuan:
 * menunjukkan bahwa penggunaan key yang sama secara berulang
 * pada pesan berbeda dapat mengungkap pola pada ciphertext.
 */
function demoKeyReuse(pesan1, pesan2, key) {
    const { ciphertext1, ciphertext2, repeatedKey, posisiIdentik,
        posisiDibandingkan, jumlahIdentik, persentaseIdentik } =
        analyzeKeyReuse(pesan1, pesan2, key);
    const jumlahPosisi = Math.min(ciphertext1.length, ciphertext2.length);


    console.log("\n============================================================");
    console.log("SECURITY / ATTACK FEATURE");
    console.log("============================================================");

    console.log("\nDEMONSTRASI KEY REUSE / REPEATED KEY");


    /* ---------------------------------------------------------
       INFORMASI DASAR
    --------------------------------------------------------- */

    console.log("\n--- Informasi Dasar ---");

    console.log(`Key yang digunakan : ${key.toUpperCase()}`);

    console.log(`Panjang key        : ${key.length}`);

    console.log(
        "Kedua pesan dienkripsi menggunakan key yang sama."
    );


    /* ---------------------------------------------------------
       PESAN 1
    --------------------------------------------------------- */

    console.log("\n--- Pesan 1 ---");

    console.log(`Plaintext : ${pesan1}`);

    console.log(`Ciphertext: ${ciphertext1}`);


    /* ---------------------------------------------------------
       PESAN 2
    --------------------------------------------------------- */

    console.log("\n--- Pesan 2 ---");

    console.log(`Plaintext : ${pesan2}`);

    console.log(`Ciphertext: ${ciphertext2}`);


    /* ---------------------------------------------------------
       REPEATING KEY SEQUENCE
    --------------------------------------------------------- */

    console.log("\n--- Repeating Key ---");

    console.log(
        `Key asli      : ${key.toUpperCase()}`
    );

    console.log(
        `Key yang repeat: ${repeatedKey}`
    );


    /* ---------------------------------------------------------
       POSISI CIPHERTEXT IDENTIK
    --------------------------------------------------------- */

    console.log(
        "\n--- Posisi Ciphertext yang Identik ---"
    );


    if (posisiIdentik.length === 0) {

        console.log(
            "Tidak ditemukan ciphertext yang identik " +
            "pada posisi yang sama."
        );

    } else {

        console.log(
            "Ditemukan karakter ciphertext yang sama " +
            "pada posisi yang sama:\n"
        );


        console.log(
            "Posisi".padEnd(10) +
            "C1".padEnd(8) +
            "C2".padEnd(8) +
            "Key".padEnd(8)
        );

        console.log("-".repeat(34));


        posisiIdentik.forEach((data) => {

            console.log(
                String(data.position).padEnd(10) +
                data.ciphertext.padEnd(8) +
                data.ciphertext.padEnd(8) +
                data.key.padEnd(8)
            );
        });
    }


    /* ---------------------------------------------------------
       STATISTIK
    --------------------------------------------------------- */

    console.log("\n--- Statistik ---");

    console.log(
        `Posisi yang dibandingkan : ${posisiDibandingkan}`
    );

    console.log(
        `Posisi ciphertext identik: ${jumlahIdentik}`
    );

    console.log(
        `Persentase identik       : ${persentaseIdentik.toFixed(2)}%`
    );


    /* ---------------------------------------------------------
       POSISI DALAM FORMAT SINGKAT
    --------------------------------------------------------- */

    if (jumlahIdentik > 0) {

        const daftarPosisi =
            posisiIdentik
                .map((data) => data.position)
                .join(", ");

        console.log(
            `\nDaftar posisi identik: [${daftarPosisi}]`
        );
    }


    /* ---------------------------------------------------------
       PERBANDINGAN KARAKTER
    --------------------------------------------------------- */

    console.log(
        "\n--- Perbandingan Posisi Ciphertext ---"
    );


    console.log(
        "Posisi".padEnd(8) +
        "C1".padEnd(8) +
        "C2".padEnd(8) +
        "Status"
    );

    console.log("-".repeat(34));


    for (let i = 0; i < jumlahPosisi; i++) {

        const c1 = ciphertext1[i];
        const c2 = ciphertext2[i];


        if (
            !isLetter(c1) ||
            !isLetter(c2)
        ) {
            continue;
        }


        const sama =
            c1.toUpperCase() ===
            c2.toUpperCase();


        console.log(
            String(i + 1).padEnd(8) +
            c1.padEnd(8) +
            c2.padEnd(8) +
            (sama
                ? "IDENTIK"
                : "BERBEDA")
        );
    }


    /* ---------------------------------------------------------
       EXPLANATION
    --------------------------------------------------------- */

    console.log(
        "\n--- Mengapa Ini Merupakan Kelemahan? ---"
    );


    console.log(
        "Vigenère menggunakan key yang berulang untuk " +
        "mengenkripsi karakter pesan."
    );

    console.log(
        "Ketika key yang sama digunakan kembali pada " +
        "pesan yang berbeda, pola penggunaan key juga sama."
    );


    console.log(
        "\nJika dua ciphertext memiliki karakter yang sama " +
        "pada posisi yang sama,"
    );

    console.log(
        "dengan asumsi key pada posisi tersebut juga sama, " +
        "maka karakter plaintext pada posisi tersebut juga sama."
    );


    console.log(
        "\nArtinya, penggunaan key yang sama secara berulang " +
        "dapat memberikan informasi/pola tambahan kepada penyerang."
    );


    console.log(
        "\nFitur ini hanya merupakan demonstrasi sederhana " +
        "mengenai key reuse."
    );

    console.log(
        "Tidak dilakukan cryptanalysis atau pembobolan key " +
        "secara penuh."
    );
}


/* =========================================================
   MENU ENKRIPSI
========================================================= */

async function menuEnkripsi() {

    console.log("\n============================================================");
    console.log("ENKRIPSI");
    console.log("============================================================");


    const plaintext =
        await tanya(
            "Masukkan Plaintext: "
        );


    const key =
        await tanya(
            "Masukkan Key: "
        );


    const errorMsg =
        validasi(
            plaintext,
            key
        );


    if (errorMsg) {

        console.log(`\n${errorMsg}`);

        return;
    }


    const {
        result,
        steps
    } = encrypt(
        plaintext,
        key
    );


    console.log("\n--- Hasil Enkripsi ---");

    console.log(
        `Plaintext : ${plaintext}`
    );

    console.log(
        `Key       : ${key.toUpperCase()}`
    );

    console.log(
        `Ciphertext: ${result}`
    );


    tampilkanLangkah(steps);
}


/* =========================================================
   MENU DEKRIPSI
========================================================= */

async function menuDekripsi() {

    console.log("\n============================================================");
    console.log("DEKRIPSI");
    console.log("============================================================");


    const ciphertext =
        await tanya(
            "Masukkan Ciphertext: "
        );


    const key =
        await tanya(
            "Masukkan Key: "
        );


    const errorMsg =
        validasi(
            ciphertext,
            key
        );


    if (errorMsg) {

        console.log(`\n${errorMsg}`);

        return;
    }


    const {
        result,
        steps
    } = decrypt(
        ciphertext,
        key
    );


    console.log("\n--- Hasil Dekripsi ---");

    console.log(
        `Ciphertext: ${ciphertext}`
    );

    console.log(
        `Key       : ${key.toUpperCase()}`
    );

    console.log(
        `Plaintext : ${result}`
    );


    tampilkanLangkah(steps);
}


/* =========================================================
   MENU SECURITY
========================================================= */

async function menuSecurity() {

    console.log("\n============================================================");
    console.log("SECURITY / ATTACK FEATURE");
    console.log("============================================================");

    console.log(
        "\nFitur ini mendemonstrasikan penggunaan key yang sama"
    );

    console.log(
        "untuk mengenkripsi dua pesan yang berbeda."
    );

    console.log(
        "Tujuannya adalah menunjukkan pola yang dapat muncul"
    );

    console.log(
        "akibat penggunaan repeated key.\n"
    );


    const pesan1 =
        await tanya(
            "Masukkan Pesan 1: "
        );


    const pesan2 =
        await tanya(
            "Masukkan Pesan 2: "
        );


    const key =
        await tanya(
            "Masukkan Key yang sama untuk keduanya: "
        );


    /* ---------------------------------------------------------
       VALIDASI
    --------------------------------------------------------- */

    if (
        !pesan1 ||
        pesan1.trim() === ""
    ) {

        console.log(
            "\nError: Pesan 1 tidak boleh kosong."
        );

        return;
    }


    if (
        !pesan2 ||
        pesan2.trim() === ""
    ) {

        console.log(
            "\nError: Pesan 2 tidak boleh kosong."
        );

        return;
    }


    if (
        !key ||
        key.trim() === ""
    ) {

        console.log(
            "\nError: Key tidak boleh kosong."
        );

        return;
    }


    if (!/^[A-Za-z]+$/.test(key)) {

        console.log(
            "\nError: Format key tidak valid."
        );

        console.log(
            "Key hanya boleh mengandung huruf A-Z."
        );

        return;
    }


    /* ---------------------------------------------------------
       JALANKAN ANALISIS
    --------------------------------------------------------- */

    demoKeyReuse(
        pesan1,
        pesan2,
        key
    );
}


/* =========================================================
   MENU UTAMA
========================================================= */

async function tampilkanMenu() {

    while (true) {

        console.log("\n");
        console.log("============================================================");
        console.log("                    VIGENÈRE CIPHER");
        console.log("============================================================");

        console.log("1. Enkripsi");
        console.log("2. Dekripsi");
        console.log("3. Test Cases");
        console.log("4. Security / Attack Feature");
        console.log("5. Keluar");


        const pilihan =
            await tanya(
                "\nPilih menu (1-5): "
            );


        switch (pilihan.trim()) {

            case "1":

                await menuEnkripsi();

                break;


            case "2":

                await menuDekripsi();

                break;


            case "3":

                jalankanTestCases();

                break;


            case "4":

                await menuSecurity();

                break;


            case "5":

                console.log(
                    "\nProgram selesai. Sampai jumpa!"
                );

                rl.close();

                return;


            default:

                console.log(
                    "\nError: Pilihan tidak valid."
                );

                console.log(
                    "Silakan pilih angka 1-5."
                );
        }
    }
}


/* =========================================================
   START PROGRAM
========================================================= */

function analyzeKeyReuse(pesan1, pesan2, key) {
    const ciphertext1 = encrypt(pesan1, key).result;
    const ciphertext2 = encrypt(pesan2, key).result;
    const jumlahHuruf = Math.max(
        pesan1.replace(/[^A-Za-z]/g, "").length,
        pesan2.replace(/[^A-Za-z]/g, "").length
    );
    let repeatedKey = "";
    for (let i = 0; i < jumlahHuruf; i++) {
        repeatedKey += key[i % key.length].toUpperCase();
    }

    const posisiIdentik = [];
    const comparison = [];
    const jumlahPosisi = Math.min(ciphertext1.length, ciphertext2.length);
    for (let i = 0; i < jumlahPosisi; i++) {
        const c1 = ciphertext1[i];
        const c2 = ciphertext2[i];
        if (!isLetter(c1) || !isLetter(c2)) continue;
        const sama = c1.toUpperCase() === c2.toUpperCase();
        comparison.push({ position: i + 1, c1, c2, status: sama ? "IDENTIK" : "BERBEDA" });
        if (sama) {
            // Preserve the CLI's key index based on the number of matches.
            posisiIdentik.push({
                position: i + 1,
                plaintext1: c1,
                plaintext2: c2,
                ciphertext: c1,
                key: key[posisiIdentik.length % key.length].toUpperCase(),
            });
        }
    }
    const posisiDibandingkan = comparison.length;
    const jumlahIdentik = posisiIdentik.length;
    const persentaseIdentik = posisiDibandingkan === 0
        ? 0 : (jumlahIdentik / posisiDibandingkan) * 100;
    return { ciphertext1, ciphertext2, repeatedKey, posisiIdentik, comparison,
        posisiDibandingkan, jumlahIdentik, persentaseIdentik };
}

function validasiSecurity(pesan1, pesan2, key) {
    if (!pesan1 || pesan1.trim() === "") return "Error: Pesan 1 tidak boleh kosong.";
    if (!pesan2 || pesan2.trim() === "") return "Error: Pesan 2 tidak boleh kosong.";
    return validasi(pesan1, key);
}

const Vigenere = Object.freeze({
    encrypt, decrypt, validasi, validasiSecurity, analyzeKeyReuse,
    TEST_CASES, MAX_VISUALIZATION_STEPS,
});

if (typeof module !== "undefined" && module.exports) module.exports = Vigenere;
if (typeof window !== "undefined") window.Vigenere = Vigenere;
if (isCLI) tampilkanMenu();
