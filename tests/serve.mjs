import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {extname, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const types = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"};

// Serve under a subdirectory too, matching GitHub Pages project hosting.
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname).replace(/^\/Protein(?=\/)/, "").replace(/^\/+/, "");
    const filename = resolve(root, relative || "index.html");
    if (!filename.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(filename);
    response.writeHead(200, {"Content-Type": types[extname(filename)] || "application/octet-stream"});
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(0, "127.0.0.1", () => {
  console.log(`ProteinDB test server: http://127.0.0.1:${server.address().port}/Protein/`);
});
