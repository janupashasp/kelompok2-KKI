"use strict";

const readline = require("readline");

/* =========================================================
   KONSTANTA
========================================================= */

const ALPHABET_SIZE = 26;
const MAX_VISUALIZATION_STEPS = 50;


/* =========================================================
   READLINE
========================================================= */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


function tanya(pertanyaan) {
    return new Promise((resolve) => {
        rl.question(pertanyaan, resolve);
    });
}


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/**
 * Mengecek apakah karakter merupakan huruf A-Z.
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
 * Mengubah angka 0-25 menjadi huruf.
 *
 * lowercase = true  -> huruf kecil
 * lowercase = false -> huruf besar
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


/**
 * Membersihkan ciphertext untuk kebutuhan analisis.
 *
 * Hanya huruf A-Z yang dipertahankan.
 */
function cleanCiphertext(ciphertext) {
    return ciphertext
        .toUpperCase()
        .replace(/[^A-Z]/g, "");
}


/* =========================================================
   INPUT VALIDATION
========================================================= */

/**
 * Validasi plaintext/ciphertext dan key.
 *
 * Key hanya boleh mengandung A-Z.
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
 * - "encrypt"
 * - "decrypt"
 *
 * Return:
 * {
 *   result: hasil akhir,
 *   steps: detail setiap langkah
 * }
 */
function processVigenere(text, key, mode) {

    const normalizedKey = key.toUpperCase();

    let result = "";
    let keyIndex = 0;

    const steps = [];


    for (let i = 0; i < text.length; i++) {

        const inputCharacter = text[i];


        /*
         * Karakter selain A-Z tidak dienkripsi.
         * Karakter tersebut juga tidak menggunakan
         * posisi key.
         */
        if (!isLetter(inputCharacter)) {

            result += inputCharacter;

            steps.push({
                position: i + 1,
                input: inputCharacter,
                key: "-",
                inputValue: "-",
                shift: "-",
                outputValue: "-",
                output: inputCharacter,
                calculation: "Karakter tidak diproses",
            });

            continue;
        }


        /*
         * Mengambil karakter key secara berulang.
         *
         * Contoh:
         *
         * Text = HELLOWORLD
         * Key  = KEY
         *
         * Key sequence:
         * K E Y K E Y K E Y K
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
                inputCharacter === inputCharacter.toLowerCase()
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
            outputValue,
            output: outputCharacter,
            calculation,
        });


        /*
         * Key hanya bergeser jika karakter input
         * merupakan huruf.
         */
        keyIndex++;
    }


    return {
        result,
        steps,
    };
}


/**
 * Enkripsi Vigenère.
 */
function encrypt(plaintext, key) {
    return processVigenere(
        plaintext,
        key,
        "encrypt"
    );
}


/**
 * Dekripsi Vigenère.
 */
function decrypt(ciphertext, key) {
    return processVigenere(
        ciphertext,
        key,
        "decrypt"
    );
}


/* =========================================================
   VISUALISASI LANGKAH ALGORITMA
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
        "\nA = 0, B = 1, ..., Z = 25\n"
    );


    const displayedSteps =
        steps.slice(
            0,
            MAX_VISUALIZATION_STEPS
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
            `\n... hanya menampilkan ${MAX_VISUALIZATION_STEPS} ` +
            `dari ${steps.length} langkah.`
        );
    }


    console.log("\nDetail perhitungan:");

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
 * Test case sengaja dibuat berbeda dari contoh:
 *
 * Contoh dosen:
 * HELLO + KEY
 *
 * Test kita:
 * 1. DATASAINS
 * 2. KULIAH KRIPTO
 * 3. RAHASIA 2026!
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


        console.log(`Test Case ${index + 1}`);
        console.log(`Input            : ${testCase.plaintext}`);
        console.log(`Key              : ${testCase.key}`);
        console.log(`Your Output      : ${output}`);
        console.log(`Expected Output  : ${testCase.expected}`);
        console.log(`Status            : ${status}`);

        console.log("-".repeat(60));
    });


    console.log("\nSUMMARY");
    console.log(`PASS : ${passed}`);
    console.log(`FAIL : ${failed}`);
    console.log(
        `TOTAL: ${TEST_CASES.length}`
    );
}


/* =========================================================
   KASISKI-STYLE SECURITY ANALYSIS
========================================================= */

/**
 * Mencari pola/trigram yang berulang.
 *
 * Contoh:
 *
 * ABCXYZABC
 *
 * ABC muncul pada posisi 0 dan 6.
 */
function findRepeatedNGrams(
    ciphertext,
    n = 3
) {

    const text =
        cleanCiphertext(ciphertext);

    const positions = {};


    for (
        let i = 0;
        i <= text.length - n;
        i++
    ) {

        const gram =
            text.slice(i, i + n);


        if (!positions[gram]) {
            positions[gram] = [];
        }


        positions[gram].push(i);
    }


    return Object.entries(positions)

        /*
         * Hanya ambil pola yang muncul
         * minimal dua kali.
         */
        .filter(([, indexes]) => {
            return indexes.length >= 2;
        })

        .map(([gram, indexes]) => {

            const distances = [];


            for (
                let i = 1;
                i < indexes.length;
                i++
            ) {

                distances.push(
                    indexes[i] -
                    indexes[i - 1]
                );
            }


            return {
                gram,
                indexes,
                distances,
            };
        });
}


/**
 * Mencari faktor dari suatu bilangan.
 *
 * Faktor yang dicari dibatasi sampai 12
 * karena kita ingin mencari kandidat
 * panjang key yang relatif pendek.
 */
function getFactors(
    number,
    maxFactor = 12
) {

    const factors = [];


    for (
        let factor = 2;
        factor <= maxFactor;
        factor++
    ) {

        if (number % factor === 0) {
            factors.push(factor);
        }
    }


    return factors;
}


/**
 * Analisis Kasiski sederhana.
 *
 * Tujuan:
 * mencari kemungkinan panjang key berdasarkan
 * jarak antar pola ciphertext yang berulang.
 */
function analyzeKasiski(ciphertext) {

    const repeatedPatterns =
        findRepeatedNGrams(
            ciphertext,
            3
        );


    const candidateScores = {};


    repeatedPatterns.forEach((pattern) => {

        pattern.distances.forEach((distance) => {

            const factors =
                getFactors(distance);


            factors.forEach((factor) => {

                candidateScores[factor] =
                    (candidateScores[factor] || 0) + 1;
            });
        });
    });


    const candidates =
        Object.entries(candidateScores)

            .map(([length, score]) => ({
                length: Number(length),
                score,
            }))

            .sort((a, b) => {
                return b.score - a.score;
            });


    return {
        cleanedLength:
            cleanCiphertext(ciphertext).length,

        repeatedPatterns,

        candidates,
    };
}


/**
 * Menampilkan hasil security analysis.
 */
function tampilkanSecurityAnalysis(
    ciphertext
) {

    const analysis =
        analyzeKasiski(ciphertext);


    console.log("\n============================================================");
    console.log("SECURITY / ATTACK ANALYSIS");
    console.log("============================================================");


    console.log(
        `\nPanjang ciphertext setelah dibersihkan: ` +
        `${analysis.cleanedLength}`
    );


    console.log(
        "\nMetode: Kasiski-style repeated pattern analysis"
    );


    /*
     * Pola berulang
     */
    console.log(
        "\n--- Pola Ciphertext yang Berulang ---"
    );


    if (
        analysis.repeatedPatterns.length === 0
    ) {

        console.log(
            "Tidak ditemukan trigram berulang."
        );

    } else {

        analysis.repeatedPatterns.forEach(
            (pattern) => {

                console.log(
                    `Pola     : ${pattern.gram}`
                );

                console.log(
                    `Posisi   : ${pattern.indexes.join(", ")}`
                );

                console.log(
                    `Jarak    : ${pattern.distances.join(", ")}`
                );

                console.log();
            }
        );
    }


    /*
     * Kandidat panjang key
     */
    console.log(
        "--- Kandidat Panjang Key ---"
    );


    if (analysis.candidates.length === 0) {

        console.log(
            "Belum ditemukan kandidat panjang key."
        );

    } else {

        analysis.candidates.forEach(
            (candidate, index) => {

                console.log(
                    `${index + 1}. ` +
                    `Panjang key = ${candidate.length}, ` +
                    `indikasi = ${candidate.score}`
                );
            }
        );
    }


    /*
     * Penjelasan security
     */
    console.log(
        "\n--- Penjelasan Keamanan ---"
    );

    console.log(
        "Vigenère menggunakan key yang berulang."
    );

    console.log(
        "Jika key relatif pendek, pola tertentu pada plaintext"
    );

    console.log(
        "dapat menghasilkan pola ciphertext yang berulang."
    );

    console.log(
        "Jarak antar pola tersebut dapat memberikan petunjuk"
    );

    console.log(
        "mengenai kemungkinan panjang key."
    );

    console.log(
        "\nCatatan: fitur ini hanya demonstrasi kelemahan,"
    );

    console.log(
        "bukan full Vigenère cracker."
    );
}


/* =========================================================
   DEMO ENKRIPSI
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


    console.log(
        `\nPlaintext : ${plaintext}`
    );

    console.log(
        `Key       : ${key}`
    );

    console.log(
        `Ciphertext: ${result}`
    );


    tampilkanLangkah(steps);
}


/* =========================================================
   DEMO DEKRIPSI
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


    console.log(
        `\nCiphertext: ${ciphertext}`
    );

    console.log(
        `Key       : ${key}`
    );

    console.log(
        `Plaintext : ${result}`
    );


    tampilkanLangkah(steps);
}


/* =========================================================
   SECURITY MENU
========================================================= */

async function menuSecurity() {

    console.log("\n============================================================");
    console.log("SECURITY / ATTACK FEATURE");
    console.log("============================================================");


    const ciphertext =
        await tanya(
            "Masukkan Ciphertext: "
        );


    if (
        !ciphertext ||
        ciphertext.trim() === ""
    ) {

        console.log(
            "\nError: Ciphertext tidak boleh kosong."
        );

        return;
    }


    tampilkanSecurityAnalysis(
        ciphertext
    );
}


/* =========================================================
   MENU UTAMA
========================================================= */

async function tampilkanMenu() {

    while (true) {

        console.log("\n");
        console.log("============================================================");
        console.log("              VIGENÈRE CIPHER");
        console.log("============================================================");

        console.log("1. Enkripsi");
        console.log("2. Dekripsi");
        console.log("3. Jalankan Test Cases");
        console.log("4. Security / Attack Analysis");
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
                    "\nError: Pilihan menu tidak valid."
                );

                console.log(
                    "Silakan pilih angka 1-5."
                );
        }
    }
}


/* =========================================================
   PROGRAM START
========================================================= */

tampilkanMenu();