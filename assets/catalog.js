/* Shared search and image handling for both static entry pages. */
const PRODUCT_IMAGES = {
  1: "assets/products/1.jpg",
  2: "assets/products/2.jpg",
  3: "assets/products/3.jpg",
  4: "assets/products/4.jpg",
  5: "assets/products/5.jpg",
  6: "assets/products/6.jpg",
  7: "assets/products/7.jpg",
  8: "assets/products/8.jpg",
  9: "assets/products/9.jpg",
  11: "assets/products/11.jpg",
  12: "assets/products/12.jpg",
  13: "assets/products/13.jpg",
  14: "assets/products/14.webp",
  15: "assets/products/15.webp",
  16: "assets/products/16.webp",
  18: "assets/products/18.webp",
  19: "assets/products/19.jpg",
  20: "assets/products/20.jpg",
  21: "assets/products/21.jpg",
  22: "assets/products/22.webp",
  23: "assets/products/23.jpg",
  24: "assets/products/24.jpg",
  25: "assets/products/25.jpg"
};

const FLAVOR_TERMS = {
  "Čokoláda": ["cokolad"],
  "Vanilka": ["vanilk"],
  "Jahoda": ["jahod"],
  "Natural": ["natural", "bez prichute"],
  "Karamel": ["karamel"],
  "Cookies": ["cookies"],
  "Orech": ["orech", "arasid", "peanut", "pb"],
  "Banán": ["banan"],
  "Pistácia": ["pistaci"]
};

function normalizeSearch(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function searchTokens(value) {
  const normalized = normalizeSearch(value);
  return normalized ? normalized.split(/\s+/) : [];
}

function matchesSearch(product, tokens) {
  const typeNames = {
    WPC: "koncentrát koncentrat syrovátkový",
    WPI: "izolát isolate",
    WPH: "hydrolyzát hydrolyzovaný hydrolyzed",
    Blend: "zmes viaczložkový vícesložkový",
    Vegan: "vegan vegánsky veganský rastlinný rostlinný"
  };
  const originNames = {
    SK: "Slovensko slovenský",
    CZ: "Česko český",
    EU: "Európa európsky",
    Global: "svet globálny"
  };
  const text = normalizeSearch([
    product.brand, product.name, product.fullName, product.type,
    typeNames[product.type], product.origin, originNames[product.origin],
    "proteín protein bielkoviny", ...product.flavors,
    ...Object.keys(FLAVOR_TERMS).filter(flavor => matchesFlavor(product, flavor))
      .map(flavor => flavor === "Natural" ? "natural bez príchute" : flavor),
    `${product.weight} g`, `${product.weight / 1000} kg`,
    product.wheyBased ? "srvátka srvátkový syrovátka syrovátkový whey" : "",
    product.lactoseFree ? "bez laktózy bezlaktózový lactose free" : ""
  ].join(" "));
  const compact = text.replace(/\s/g, "");
  return tokens.every(token => text.includes(token) || compact.includes(token));
}

function matchesFlavor(product, flavor) {
  if (flavor === "all") return true;
  const terms = FLAVOR_TERMS[flavor] || [normalizeSearch(flavor)];
  return product.flavors.some(value => terms.some(term => normalizeSearch(value).includes(term)));
}

function imageMarkup(product, lazy = false) {
  return `
    <div class="loading-img" aria-hidden="true"><div class="spinner"></div></div>
    <img alt="${product.brand} ${product.name}" width="300" height="300"
      loading="${lazy ? "lazy" : "eager"}" decoding="async" style="visibility:hidden">
    <div class="ph" role="img" aria-label="Fotografia produktu nie je dostupná">
      <svg width="44" height="50" viewBox="0 0 44 50" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="7" y="9" width="30" height="36" rx="5"/><path d="M11 9V4h22v5M14 22h16M14 29h16"/>
      </svg>
      <span class="ph-txt">${product.brand}<br>Fotografia nie je dostupná</span>
    </div>`;
}

function loadProductImage(container, product) {
  const image = container.querySelector("img");
  const loading = container.querySelector(".loading-img");
  const placeholder = container.querySelector(".ph");
  const finish = loaded => {
    loading.style.display = "none";
    image.style.visibility = loaded ? "visible" : "hidden";
    placeholder.style.display = loaded ? "none" : "flex";
  };
  image.addEventListener("load", () => finish(image.naturalWidth > 0), {once: true});
  image.addEventListener("error", () => finish(false), {once: true});
  const source = PRODUCT_IMAGES[product.id];
  if (source) image.src = source;
  else finish(false);
}

function toggleFilters() {
  const button = document.getElementById("filter-toggle");
  const expanded = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(expanded));
  button.textContent = expanded ? "Skryť filtre" : "Zobraziť filtre";
  document.getElementById("filters").classList.toggle("open", expanded);
}
