# ProteinDB

Statická SK/CZ databáza 25 proteínov.

## Funkcie
- Vyhľadávanie názvu, značky, typu, príchute, pôvodu a gramáže.
- Vyhľadávanie ignoruje diakritiku, veľkosť písmen, nadbytočné medzery a poradie slov.
- Kombinovateľné filtre, triedenie a detail produktu.
- Na mobile sú filtre zbalené, aby boli výsledky vyhľadávania hneď viditeľné.
- Lokálne produktové fotografie v kartách aj v detaile, bez externého API.
- Pri chýbajúcej alebo poškodenej fotke sa zobrazí zrozumiteľná náhrada.

## Spustenie
Otvorte `index.html` alebo `protein-db.html` v prehliadači. Oba vstupy fungujú
aj na GitHub Pages a Vercel bez serverových funkcií. Pri nahrávaní stránky
zachovajte priečinok `assets` vedľa HTML súborov.

## Fotografie a údaje
Spoločná logika vyhľadávania a mapa fotografií sú v `assets/catalog.js`.
Pôvod fotografií je zdokumentovaný v `assets/products/sources.json`.
Fotografie môžu zobrazovať inú príchuť alebo veľkosť balenia.

Pre 23 produktov sú uložené overené fotografie. Pri položkách **Prom-in Wellness
Whey** a **Kompava Whey Protein 80** sa presný produkt nepodarilo overiť, preto
zobrazujú náhradu. Pred doplnením ich fotografií treba overiť názov aj údaje
produktu. Ceny, dostupnosť a pôvodné nutričné údaje nie sú živé údaje z e-shopov.

## Testy
Vyžadujú Node.js 22 alebo novší, bez inštalácie závislostí:

```sh
node --test tests/catalog.test.mjs
```

Testy kontrolujú oba vstupy, vyhľadávanie, kombinácie filtrov, triedenie,
reset, detail a spracovanie obrázkov. Spúšťajú sa aj v GitHub Actions.
