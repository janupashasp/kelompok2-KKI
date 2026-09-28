const test = require("node:test");
const assert = require("node:assert/strict");
const cipher = require("../fungsi.js");

test("known Vigenère vector and inverse", () => {
    assert.equal(cipher.encrypt("ATTACKATDAWN", "LEMON").result, "LXFOPVEFRNHR");
    assert.equal(cipher.decrypt("LXFOPVEFRNHR", "LEMON").result, "ATTACKATDAWN");
});

test("case, whitespace, punctuation, Unicode and key advancement", () => {
    const input = "  Aa! aA 2026 é🙂\n";
    const encrypted = cipher.encrypt(input, "bC");
    assert.equal(encrypted.result, "  Bc! bC 2026 é🙂\n");
    assert.equal(cipher.decrypt(encrypted.result, "bC").result, input);
    assert.equal(encrypted.steps[0].calculation, "Karakter tidak diproses");
    assert.equal(encrypted.steps[2].key, "B");
    assert.equal(encrypted.steps[6].key, "B");
});

test("validation returns only the first error without normalizing inputs", () => {
    assert.equal(cipher.validasi("  ", "!"), "Error: Teks tidak boleh kosong.");
    assert.equal(cipher.validasi("A", "  "), "Error: Key tidak boleh kosong.");
    for (const key of [" A", "A ", "A1", "A!", "é"]) {
        assert.equal(cipher.validasi("A", key), "Error: Format key tidak valid.\nKey hanya boleh mengandung huruf A-Z.");
    }
    assert.equal(cipher.validasi("123 !", "abc"), null);
});

test("security validation preserves message order", () => {
    assert.equal(cipher.validasiSecurity("", "", ""), "Error: Pesan 1 tidak boleh kosong.");
    assert.equal(cipher.validasiSecurity("a", "\n", ""), "Error: Pesan 2 tidak boleh kosong.");
    assert.equal(cipher.validasiSecurity("a", "b", ""), "Error: Key tidak boleh kosong.");
    assert.equal(cipher.validasiSecurity("a", "b", "!"), cipher.validasi("a", "!"));
});

test("full output and step data remain intact beyond the visualization limit", () => {
    const output = cipher.encrypt("A".repeat(73), "B");
    assert.equal(output.result, "B".repeat(73));
    assert.equal(output.steps.length, 73);
    assert.equal(cipher.MAX_VISUALIZATION_STEPS, 50);
});

test("security keeps original character positions and the CLI match-based key column", () => {
    const analysis = cipher.analyzeKeyReuse("AAA", "XAA", "BC");
    assert.deepEqual(analysis.posisiIdentik.map(({ position, key }) => ({ position, key })), [
        { position: 2, key: "B" }, { position: 3, key: "C" },
    ]);
    assert.equal(analysis.persentaseIdentik.toFixed(2), "66.67");
    const unequal = cipher.analyzeKeyReuse("A-A", "AAAA", "BC");
    assert.equal(unequal.repeatedKey, "BCBC");
    assert.equal(unequal.posisiDibandingkan, 2);
    assert.deepEqual(unequal.comparison.map((entry) => entry.position), [1, 3]);
});

test("security handles zero comparable letters, case-insensitive matches and long tables", () => {
    const empty = cipher.analyzeKeyReuse("123!", "?!", "KEY");
    assert.equal(empty.repeatedKey, "");
    assert.equal(empty.persentaseIdentik.toFixed(2), "0.00");
    assert.deepEqual(empty.comparison, []);
    assert.equal(cipher.analyzeKeyReuse("Aa", "aA", "B").jumlahIdentik, 2);
    assert.equal(cipher.analyzeKeyReuse("A".repeat(65), "A".repeat(65), "KEY").comparison.length, 65);
});

test("the three supplied expected values remain unchanged", () => {
    assert.deepEqual(cipher.TEST_CASES, [
        { plaintext: "DATASAINS", key: "UGM", expected: "XGFUYMCTE" },
        { plaintext: "KULIAH KRIPTO", key: "LOGIC", expected: "VIRQCS YXQREC" },
        { plaintext: "RAHASIA 2026!", key: "AI", expected: "RIHISQA 2026!" },
    ]);
    assert.deepEqual(cipher.TEST_CASES.map((item) => cipher.encrypt(item.plaintext, item.key).result), [
        "XGFUYMCTE", "VIRQCS YXQREC", "RIHISQA 2026!",
    ]);
});
