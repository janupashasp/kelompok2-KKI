"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const files = new Map([
    ["/", ["index.html", "text/html; charset=utf-8"]],
    ["/index.html", ["index.html", "text/html; charset=utf-8"]],
    ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
    ["/fungsi.js", ["fungsi.js", "text/javascript; charset=utf-8"]],
    ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
]);
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (request, response) => {
    const file = files.get(new URL(request.url, "http://localhost").pathname);
    if (!file || !["GET", "HEAD"].includes(request.method)) {
        response.writeHead(404).end("Not found");
        return;
    }
    try {
        const content = await fs.readFile(path.join(__dirname, file[0]));
        response.writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-cache" });
        response.end(request.method === "HEAD" ? undefined : content);
    } catch {
        response.writeHead(500).end("File tidak dapat dibaca.");
    }
});
server.on("error", (error) => {
    console.error(`Server tidak dapat dijalankan: ${error.message}`);
    process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
    console.log(`Vigenère Cipher: http://localhost:${port}`);
});
