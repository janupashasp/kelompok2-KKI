"use strict";

(() => {
    const engine = window.Vigenere;
    const main = document.querySelector("main");
    let ended = false;
    const customTestCases = [];
    const menu = [
        ["enkripsi", "Enkripsi", "Ubah plaintext menjadi ciphertext.", "P → C"],
        ["dekripsi", "Dekripsi", "Kembalikan ciphertext ke pesan asli.", "C → P"],
        ["test-cases", "Test Cases", "Jalankan uji bawaan atau masukkan test case sendiri.", "Uji hasil"],
        ["security", "Security / Attack Feature", "Amati pola dari penggunaan key yang sama.", "Key reuse"],
        ["keluar", "Keluar", "Akhiri sesi praktikum.", "Selesai"],
    ];

    // User input is escaped before inclusion in result markup.
    const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
    const badge = (status) => `<span class="status ${status === "PASS" || status === "IDENTIK" ? "pass" : status === "FAIL" ? "fail" : "neutral"}">${escape(status)}</span>`;
    const value = (label, content, emphasis = false) => `<div class="value${emphasis ? " value-emphasis" : ""}"><dt>${label}</dt><dd>${escape(content)}</dd></div>`;
    const table = (label, headings, rows) => `<div class="table-scroll" role="region" aria-label="${label}" tabindex="0"><table><caption class="sr-only">${label}</caption><thead><tr>${headings.map((heading) => `<th scope="col">${heading}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
    const cells = (values) => `<tr>${values.map((entry) => `<td>${escape(entry)}</td>`).join("")}</tr>`;

    function home() {
        main.innerHTML = `<section class="workspace">
            <div class="workspace-intro">
                <p class="eyebrow">Ruang praktikum</p>
                <h1 tabindex="-1">Vigenère<br>Cipher<span class="title-dot">.</span></h1>
                <p class="intro-copy">Satu pesan, satu key.<br>Pelajari setiap pergeseran hurufnya.</p>
                <div class="formula-note"><span class="small-label">Substitusi polialfabetik</span><p class="formula">C = (P + K) mod 26</p><p>Key berulang. Huruf bergeser.<br>Spasi dan tanda baca tetap.</p></div>
            </div>
            <nav class="menu-list" aria-label="Menu utama">
                <p class="menu-heading">Pilih proses <span>5 pilihan</span></p>
                ${menu.map(([id, label, description, notation], index) => `<a class="menu-item${index === 0 ? " menu-primary" : ""}${id === "keluar" ? " menu-exit" : ""}" href="#${id}"><span class="menu-number">0${index + 1}</span><span class="menu-copy"><strong>${label}</strong><span>${description}</span></span><span class="menu-notation mono">${notation}</span><span class="chevron" aria-hidden="true">›</span></a>`).join("")}
            </nav>
        </section>`;
    }

    function pageHeader(id, description) {
        const index = menu.findIndex((item) => item[0] === id);
        return `<nav class="breadcrumb" aria-label="Navigasi halaman"><a class="back-link" href="#menu"><span aria-hidden="true">←</span> Menu utama</a><span class="breadcrumb-current">${menu[index][1]}</span></nav>
            <header class="page-heading"><p class="eyebrow">Proses 0${index + 1}</p><h1 tabindex="-1">${menu[index][1]}</h1><p>${description}</p></header>`;
    }

    function textField(id, label, hint, placeholder) {
        return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" name="${id}" rows="5" placeholder="${placeholder}" aria-describedby="${id}-hint" spellcheck="false" autocapitalize="off"></textarea><p class="field-hint" id="${id}-hint">${hint}</p></div>`;
    }

    function keyField(label = "Key") {
        return `<div class="field"><label for="key">${label}</label><input id="key" name="key" type="text" placeholder="Masukkan key" aria-describedby="key-hint" spellcheck="false" autocapitalize="off" autocomplete="off"><p class="field-hint" id="key-hint">Hanya huruf A–Z. Key diulang otomatis sepanjang huruf pada pesan.</p></div>`;
    }

    function errorMessage(form, message, fieldId) {
        form.querySelectorAll("[aria-invalid]").forEach((input) => {
            input.removeAttribute("aria-invalid");
            input.setAttribute("aria-describedby", `${input.id}-hint`);
        });
        const error = form.querySelector(".form-error");
        error.textContent = message || "";
        error.hidden = !message;
        if (message) {
            const field = form.elements.namedItem(fieldId);
            field.setAttribute("aria-invalid", "true");
            field.setAttribute("aria-describedby", `${fieldId}-hint form-error`);
            field.focus();
        }
    }

    function emptyResult(label) {
        return `<div class="panel empty-result"><span class="small-label">Hasil ${label.toLowerCase()}</span><div class="empty-content"><span class="empty-symbol mono" aria-hidden="true">${label === "Dekripsi" ? "C − K" : label === "Analisis" ? "C₁ : C₂" : "P + K"}</span><h2>Menunggu masukan</h2><p>Isi pesan dan key, lalu jalankan ${label.toLowerCase()} untuk melihat hasilnya.</p></div><p class="empty-foot">Perhitungan berlangsung di browser Anda.</p></div>`;
    }

    function cipherPage(mode) {
        const encrypting = mode === "enkripsi";
        const title = encrypting ? "Enkripsi" : "Dekripsi";
        const inputLabel = encrypting ? "Plaintext" : "Ciphertext";
        const outputLabel = encrypting ? "Ciphertext" : "Plaintext";
        main.innerHTML = pageHeader(mode, encrypting
            ? "Ubah pesan menjadi teks sandi, lalu ikuti perhitungannya huruf demi huruf."
            : "Kembalikan teks sandi ke pesan asli menggunakan key yang sama.") +
            `<div class="process-grid"><section class="panel input-panel" aria-labelledby="input-heading"><div class="panel-heading"><h2 id="input-heading">Pesan & key</h2><span class="small-label">${inputLabel} → ${outputLabel}</span></div>
                <form novalidate>${textField("text", inputLabel, "Huruf besar/kecil, spasi, angka, dan tanda baca dipertahankan.", `Masukkan ${inputLabel.toLowerCase()} Anda…`)}${keyField()}
                <p class="form-error" id="form-error" role="alert" hidden></p><button class="primary-button" type="submit">${title}</button></form>
                <div class="input-formula"><span>Rumus ${title.toLowerCase()}</span><code>${encrypting ? "C = (P + K) mod 26" : "P = (C - K + 26) mod 26"}</code></div>
            </section><div id="result">${emptyResult(title)}</div></div><div id="steps"></div>`;
        const form = main.querySelector("form");
        const result = main.querySelector("#result");
        const steps = main.querySelector("#steps");
        form.addEventListener("input", () => {
            errorMessage(form, null);
            result.innerHTML = emptyResult(title);
            steps.replaceChildren();
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const text = form.elements.text.value;
            const key = form.elements.key.value;
            const error = engine.validasi(text, key);
            errorMessage(form, error, !text.trim() ? "text" : "key");
            if (error) return;
            const output = (encrypting ? engine.encrypt : engine.decrypt)(text, key);
            result.innerHTML = `<section class="panel result-panel" aria-labelledby="result-heading"><div class="panel-heading"><h2 id="result-heading" tabindex="-1">Hasil ${title}</h2><span class="status neutral">Selesai</span></div><dl class="result-values">${value(inputLabel, text)}${value("Key", key.toUpperCase())}${value(outputLabel, output.result, true)}</dl><p class="result-foot">Lihat proses setiap karakter pada visualisasi di bawah.</p></section>`;
            steps.innerHTML = renderSteps(output.steps);
            result.querySelector("h2").focus({ preventScroll: true });
            result.scrollIntoView({ block: "nearest" });
        });
    }

    function renderSteps(steps) {
        const displayed = steps.slice(0, engine.MAX_VISUALIZATION_STEPS);
        return `<section class="visualization" aria-labelledby="steps-heading"><div class="section-heading"><div><p class="eyebrow">Di balik hasil</p><h2 id="steps-heading">Visualisasi Langkah Algoritma</h2></div><p class="mono">A = 0, B = 1, ..., Z = 25</p></div>
            <div class="formula-pair"><p>Enkripsi <code>C = (P + K) mod 26</code></p><p>Dekripsi <code>P = (C - K + 26) mod 26</code></p></div>
            <div class="panel steps-panel">${table("Langkah algoritma", ["No.", "Input", "Key", "P/C", "Shift", "Output"], displayed.map((step) => cells([step.position, step.input, step.key, step.inputValue, step.shift, step.output])))}
            ${steps.length > engine.MAX_VISUALIZATION_STEPS ? `<p class="limit-note">... hanya menampilkan 50 dari ${steps.length} langkah.</p>` : ""}
            <div class="calculation"><h3>Detail Perhitungan</h3><ol class="calculation-list">${displayed.map((step) => `<li><code>${escape(step.calculation)}</code></li>`).join("")}</ol></div></div></section>`;
    }

    function testsPage() {
        main.innerHTML = pageHeader("test-cases", "Tiga test case bawaan dijalankan otomatis. Tambahkan pasangan plaintext, key, dan expected ciphertext untuk menguji hasil Anda sendiri.") +
            `<section class="panel input-panel test-input-panel" aria-labelledby="test-input-heading">
                <div class="panel-heading"><h2 id="test-input-heading">Tambah test case</h2></div>
                <form novalidate><div class="test-input-grid"><div>
                    ${textField("text", "Plaintext", "Spasi, tanda baca, dan huruf besar/kecil dipertahankan.", "Masukkan plaintext yang ingin diuji…")}
                    ${keyField()}
                </div><div>${textField("expected", "Expected Ciphertext", "Hasil yang Anda harapkan. Perbandingan harus sama persis, termasuk huruf besar/kecil dan spasi.", "Masukkan ciphertext yang diharapkan…")}</div></div>
                <p class="form-error" id="form-error" role="alert" hidden></p>
                <button class="primary-button" type="submit">Tambahkan & uji</button>
                <p class="field-hint">Test case tambahan tersedia selama sesi ini dan terhapus saat halaman dimuat ulang.</p>
                <p class="test-feedback" role="status" aria-live="polite"></p>
                </form>
            </section><div id="test-results"></div>`;
        renderTestResults();
        const form = main.querySelector("form");
        const feedback = form.querySelector(".test-feedback");
        form.addEventListener("input", () => {
            errorMessage(form, null);
            feedback.textContent = "";
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const plaintext = form.elements.text.value;
            const key = form.elements.key.value;
            const expected = form.elements.expected.value;
            const error = engine.validasi(plaintext, key);
            errorMessage(form, error, !plaintext.trim() ? "text" : "key");
            if (error) return;
            if (!expected.trim()) {
                errorMessage(form, "Error: Expected Ciphertext tidak boleh kosong.", "expected");
                return;
            }
            const output = engine.encrypt(plaintext, key).result;
            const status = output === expected ? "PASS" : "FAIL";
            customTestCases.push({ plaintext, key, expected });
            renderTestResults();
            feedback.textContent = `Test Case ${engine.TEST_CASES.length + customTestCases.length} ditambahkan. Status: ${status}.`;
        });
    }

    function renderTestResults() {
        const results = [...engine.TEST_CASES, ...customTestCases].map((test) => {
            const output = engine.encrypt(test.plaintext, test.key).result;
            return { ...test, output, status: output === test.expected ? "PASS" : "FAIL" };
        });
        const passed = results.filter((test) => test.status === "PASS").length;
        main.querySelector("#test-results").innerHTML =
            `<div class="section-heading"><h2>Hasil test cases</h2><p>${engine.TEST_CASES.length} bawaan · ${customTestCases.length} tambahan</p></div>
            <section class="panel test-panel" aria-label="Hasil test cases">${table("Hasil test cases", ["Test Case", "Plaintext", "Key", "Expected Ciphertext", "Your Output", "Status"], results.map((test, index) => `<tr><th scope="row">${String(index + 1).padStart(2, "0")}<span class="test-origin">${index < engine.TEST_CASES.length ? "Bawaan" : "Tambahan"}</span></th><td>${escape(test.plaintext)}</td><td>${escape(test.key)}</td><td>${escape(test.expected)}</td><td class="actual-output">${escape(test.output)}</td><td>${badge(test.status)}</td></tr>`))}</section>
            <section class="test-summary" aria-labelledby="summary-heading"><div><p class="eyebrow">Hasil pengujian</p><h2 id="summary-heading">Test Summary</h2></div><dl class="summary-values"><div><dt>PASS</dt><dd class="pass-text">${passed}</dd></div><div><dt>FAIL</dt><dd class="${passed !== results.length ? "fail-text" : ""}">${results.length - passed}</dd></div><div><dt>TOTAL</dt><dd>${results.length}</dd></div></dl></section>
            <p class="method-note">Status diperoleh dari perbandingan Your Output dengan Expected Ciphertext.</p>`;
    }

    function securityPage() {
        main.innerHTML = pageHeader("security", "Demonstrasi key reuse: amati pola pada dua pesan yang dienkripsi menggunakan key yang sama.") +
            `<div class="security-intro"><p>Fitur ini mendemonstrasikan penggunaan key yang sama untuk mengenkripsi dua pesan yang berbeda. Tujuannya adalah menunjukkan pola yang dapat muncul akibat penggunaan repeated key.</p></div>
            <div class="process-grid security-grid"><section class="panel input-panel" aria-labelledby="input-heading"><div class="panel-heading"><h2 id="input-heading">Dua pesan, satu key</h2></div><form novalidate>
            ${textField("pesan1", "Pesan 1", "Pesan pertama yang akan dienkripsi.", "Masukkan pesan pertama…")}
            ${textField("pesan2", "Pesan 2", "Pesan kedua yang akan dibandingkan.", "Masukkan pesan kedua…")}${keyField("Key yang sama untuk keduanya")}
            <p class="form-error" id="form-error" role="alert" hidden></p><button class="primary-button" type="submit">Jalankan analisis</button></form></section><div id="result">${emptyResult("Analisis")}</div></div>`;
        const form = main.querySelector("form");
        const result = main.querySelector("#result");
        form.addEventListener("input", () => {
            errorMessage(form, null);
            result.innerHTML = emptyResult("Analisis");
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const pesan1 = form.elements.pesan1.value;
            const pesan2 = form.elements.pesan2.value;
            const key = form.elements.key.value;
            const error = engine.validasiSecurity(pesan1, pesan2, key);
            errorMessage(form, error, !pesan1.trim() ? "pesan1" : !pesan2.trim() ? "pesan2" : "key");
            if (error) return;
            result.innerHTML = securityResult(pesan1, pesan2, key);
            result.querySelector("h2").focus({ preventScroll: true });
            result.scrollIntoView({ block: "nearest" });
        });
    }

    function securityResult(pesan1, pesan2, key) {
        const data = engine.analyzeKeyReuse(pesan1, pesan2, key);
        return `<div class="analysis-results">
            <section class="panel"><h2 tabindex="-1">Informasi Dasar</h2><dl class="result-values">${value("Key yang digunakan", key.toUpperCase())}${value("Panjang key", key.length)}</dl><p>Kedua pesan dienkripsi menggunakan key yang sama.</p></section>
            <section class="panel"><h2>Pesan 1</h2><dl class="result-values">${value("Plaintext", pesan1)}${value("Ciphertext", data.ciphertext1, true)}</dl></section>
            <section class="panel"><h2>Pesan 2</h2><dl class="result-values">${value("Plaintext", pesan2)}${value("Ciphertext", data.ciphertext2, true)}</dl></section>
            <section class="panel"><h2>Repeating Key</h2><dl class="result-values">${value("Key asli", key.toUpperCase())}${value("Key yang repeat", data.repeatedKey)}</dl></section>
            <section class="panel"><h2>Posisi Ciphertext yang Identik</h2>${data.posisiIdentik.length ? `<p>Ditemukan karakter ciphertext yang sama pada posisi yang sama:</p>${table("Posisi ciphertext identik", ["Posisi", "C1", "C2", "Key"], data.posisiIdentik.map((item) => cells([item.position, item.ciphertext, item.ciphertext, item.key])))}` : `<p class="inline-empty">Tidak ditemukan ciphertext yang identik pada posisi yang sama.</p>`}</section>
            <section class="panel"><h2>Statistik</h2><dl class="statistics"><div><dt>Posisi yang dibandingkan</dt><dd>${data.posisiDibandingkan}</dd></div><div><dt>Posisi ciphertext identik</dt><dd>${data.jumlahIdentik}</dd></div><div><dt>Persentase identik</dt><dd>${data.persentaseIdentik.toFixed(2)}%</dd></div></dl>${data.jumlahIdentik ? `<p class="position-list">Daftar posisi identik: <span class="mono">[${data.posisiIdentik.map((item) => item.position).join(", ")}]</span></p>` : ""}</section>
            <section class="panel"><h2>Perbandingan Posisi Ciphertext</h2>${data.comparison.length ? table("Perbandingan posisi ciphertext", ["Posisi", "C1", "C2", "Status"], data.comparison.map((item) => `<tr><td>${item.position}</td><td>${escape(item.c1)}</td><td>${escape(item.c2)}</td><td>${badge(item.status)}</td></tr>`)) : `<p class="inline-empty">Tidak ada posisi yang keduanya berupa huruf untuk dibandingkan.</p>`}</section>
            <section class="explanation"><p class="eyebrow">Memahami polanya</p><h2>Mengapa Ini Merupakan Kelemahan?</h2>
            <p>Vigenère menggunakan key yang berulang untuk mengenkripsi karakter pesan.</p><p>Ketika key yang sama digunakan kembali pada pesan yang berbeda, pola penggunaan key juga sama.</p>
            <p>Jika dua ciphertext memiliki karakter yang sama pada posisi yang sama, dengan asumsi key pada posisi tersebut juga sama, maka karakter plaintext pada posisi tersebut juga sama.</p>
            <p>Artinya, penggunaan key yang sama secara berulang dapat memberikan informasi/pola tambahan kepada penyerang.</p>
            <p>Fitur ini hanya merupakan demonstrasi sederhana mengenai key reuse. Tidak dilakukan cryptanalysis atau pembobolan key secara penuh.</p></section>
        </div>`;
    }

    function route() {
        const id = location.hash.slice(1) || "menu";
        if (ended || id === "keluar") {
            ended = true;
            customTestCases.length = 0;
            main.innerHTML = `<section class="exit-screen"><p class="eyebrow">Sesi berakhir</p><h1 tabindex="-1">Sampai jumpa.</h1><p>Program selesai. Sampai jumpa!</p></section>`;
            document.title = "Sesi berakhir · Vigenère Cipher";
        } else {
            const current = menu.find((item) => item[0] === id);
            document.title = current ? `${current[1]} · Vigenère Cipher` : "Vigenère Cipher";
            if (id === "enkripsi" || id === "dekripsi") cipherPage(id);
            else if (id === "test-cases") testsPage();
            else if (id === "security") securityPage();
            else home();
        }
        window.scrollTo(0, 0);
        main.querySelector("h1").focus({ preventScroll: true });
    }

    document.querySelector(".skip-link").addEventListener("click", (event) => {
        event.preventDefault();
        main.focus();
        main.scrollIntoView({ block: "start" });
    });
    window.addEventListener("hashchange", route);
    route();
})();
