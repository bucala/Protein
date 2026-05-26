# Changelog

## [1.1.0] – 2026-05-26
### Opravené
- Odstránený Anthropic image fetch (`fetchProductImage`, `loadCardImage`, `loadModalImage`).
- Statické `image` URL pridané do každého produktu v DB.
- Karty a modálne okno teraz zobrazujú obrázky priamo cez `src="${p.image}"` bez async volania.
- Fallback na emoji placeholder pri chybe načítania obrázka.

### Pridané
- `README.md` s popisom projektu a spustenia.
- `CHANGELOG.md`.
