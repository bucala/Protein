import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import vm from "node:vm";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const helpers = readFileSync(resolve(root, "assets/catalog.js"), "utf8");

function element() {
  const children = new Map();
  const handlers = new Map();
  const classes = new Set();
  const attributes = new Map();
  return {
    style: {}, value: "", textContent: "", innerHTML: "", naturalWidth: 0,
    dataset: {}, handlers,
    classList: {
      add: value => classes.add(value), remove: value => classes.delete(value),
      toggle: (value, on) => on ? classes.add(value) : classes.delete(value)
    },
    addEventListener: (name, handler) => handlers.set(name, handler),
    getAttribute: name => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
    querySelector(selector) {
      if (!children.has(selector)) children.set(selector, element());
      return children.get(selector);
    },
    focus() {}
  };
}

function loadPage(filename) {
  const html = readFileSync(resolve(root, filename), "utf8");
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).join("\n");
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    querySelectorAll: () => [],
    querySelector: () => element(),
    addEventListener() {},
    body: element()
  };
  const context = vm.createContext({document});
  new vm.Script(helpers, {filename: "assets/catalog.js"}).runInContext(context);
  new vm.Script(script, {filename}).runInContext(context);
  const run = code => vm.runInContext(code, context);
  const ids = () => Array.from(run("active.map(p => p.id)"));
  const search = value => {
    run(`F.search = ${JSON.stringify(value)}; applyFilters();`);
    return ids();
  };
  return {html, context, document, run, ids, search};
}

for (const page of ["index.html", "protein-db.html"]) {
  test(`${page}: starts and shows the full catalog`, () => {
    const app = loadPage(page);
    assert.equal(app.ids().length, 25);
    assert.equal(app.document.getElementById("gct").textContent, "25 proteínov");
    assert.match(app.html, /src="\.\/assets\/catalog\.js"/);
  });

  test(`${page}: search ignores accents, case, whitespace and token order`, () => {
    const app = loadPage(page);
    assert.deepEqual(app.search("  JAHODA  vilgain  "), [1, 2, 4]);
    assert.deepEqual(app.search("VILGAIN jahôda"), [1, 2, 4]);
    assert.deepEqual(app.search("   \t "), Array.from({length: 25}, (_, i) => i + 1));
    assert.deepEqual(app.search("promin CFM"), [9]);
    assert.deepEqual(app.search("voxberg women’s"), [7]);
  });

  test(`${page}: finds localized types, flavors, weight and lactose status`, () => {
    const app = loadPage(page);
    assert.ok(app.search("cokolada").includes(3));
    assert.deepEqual(app.search("rastlinny protein"), [8]);
    assert.deepEqual(app.search("gymbeam izolat 1kg"), [15]);
    assert.deepEqual(app.search("koliba bez prichute"), [18]);
    assert.deepEqual(app.search("vilgain bez laktozy"), [3, 4]);
    assert.equal(app.search("srvatkovy").length, 24);
  });

  test(`${page}: combines search with filters and sorts results`, () => {
    const app = loadPage(page);
    app.run('F.type = "WPI";');
    assert.deepEqual(app.search("gymbeam"), [15, 16]);
    app.run('F.flavor = "Čokoláda";');
    assert.deepEqual(app.search(""), [2, 13, 15, 20]);
    app.run('F.type = "all"; F.flavor = "Orech";');
    assert.ok(app.search("").includes(14), "peanut butter should match the nut filter");
    app.run('resetAll(); sortV = "pa"; applyFilters();');
    const prices = Array.from(app.run("active.map(p => p.price)"));
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  test(`${page}: empty results, clear, reset and modal remain functional`, () => {
    const app = loadPage(page);
    assert.deepEqual(app.search("neexistujuci-produkt-xyz"), []);
    assert.match(app.document.getElementById("grid").innerHTML, /Žiadne výsledky/);
    app.run('F.origin = "SK"; resetAll();');
    assert.equal(app.ids().length, 25);
    app.search("vilgain");
    app.document.getElementById("scl").handlers.get("click")();
    assert.equal(app.ids().length, 25);
    app.run("openModal(1)");
    assert.match(app.document.getElementById("mini").innerHTML, /<img alt="Vilgain/);
    app.run("closeModal()");
    assert.equal(app.document.body.style.overflow, "");
  });

  test(`${page}: mobile filters can be opened and closed`, () => {
    const app = loadPage(page);
    const button = app.document.getElementById("filter-toggle");
    app.run("toggleFilters()");
    assert.equal(button.getAttribute("aria-expanded"), "true");
    assert.equal(button.textContent, "Skryť filtre");
    app.run("toggleFilters()");
    assert.equal(button.getAttribute("aria-expanded"), "false");
    assert.equal(button.textContent, "Zobraziť filtre");
  });
}

test("both pages have identical catalog data", () => {
  const first = loadPage("index.html");
  const second = loadPage("protein-db.html");
  const catalog = app => JSON.parse(app.run("JSON.stringify(DB)"));
  assert.deepEqual(catalog(first), catalog(second));
});

test("every configured image is a local, nonempty JPEG, PNG or WebP", () => {
  const app = loadPage("index.html");
  const images = Object.values(app.run("PRODUCT_IMAGES"));
  assert.equal(images.length, 23);
  for (const image of images) {
    assert.match(image, /^assets\/products\/\d+\.(jpg|png|webp)$/);
    const path = resolve(root, image);
    assert.ok(existsSync(path), `missing image: ${image}`);
    const bytes = readFileSync(path);
    assert.ok(bytes.length > 1000, `empty or tiny image: ${image}`);
    const valid = image.endsWith(".jpg") ? bytes[0] === 255 && bytes[1] === 216 :
      image.endsWith(".png") ? bytes.subarray(1, 4).toString() === "PNG" :
      bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
    assert.ok(valid, `invalid image format: ${image}`);
  }
});

test("image handling covers load, error and missing photo", () => {
  const app = loadPage("index.html");
  const product = app.run("DB[0]");
  for (const loaded of [true, false]) {
    const container = element();
    app.context.loadProductImage(container, product);
    const image = container.querySelector("img");
    image.naturalWidth = loaded ? 300 : 0;
    image.handlers.get(loaded ? "load" : "error")();
    assert.equal(container.querySelector(".loading-img").style.display, "none");
    assert.equal(image.style.visibility, loaded ? "visible" : "hidden");
    assert.equal(container.querySelector(".ph").style.display, loaded ? "none" : "flex");
  }
  const container = element();
  app.context.loadProductImage(container, {id: 999});
  assert.equal(container.querySelector(".ph").style.display, "flex");
  assert.equal(container.querySelector(".loading-img").style.display, "none");
});

test("photo provenance matches the configured images and documents missing photos", () => {
  const app = loadPage("index.html");
  const images = app.run("PRODUCT_IMAGES");
  const sources = JSON.parse(readFileSync(resolve(root, "assets/products/sources.json"), "utf8"));
  assert.equal(sources.length, 25);
  assert.equal(new Set(sources.map(source => source.id)).size, 25);
  for (const source of sources) {
    if (source.file) {
      assert.equal(images[source.id], source.file);
      assert.match(source.page, /^https:\/\//);
      assert.match(source.url, /^https:\/\//);
    } else {
      assert.equal(images[source.id], undefined);
      assert.ok(source.reason);
    }
  }
});
