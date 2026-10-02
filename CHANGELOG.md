# Changelog

## 2026-10-02
### Fixed
- Fixed the JavaScript syntax error preventing the legacy page from starting.
- Search now handles accents, whitespace, multiple words, flavors and localized types.
- Chocolate flavor variants and peanut butter now match their filters.
- Both product cards and modals load photos and handle failures without stuck spinners.
- Collapsed mobile filters so search results are visible without scrolling past the sidebar.
- Replaced the Vercel-only image proxy with 23 verified local product photos.
- Documented the two unverified products without substituting unrelated photos.

### Added
- Shared search and image helpers, photo provenance and regression tests for both pages.
- GitHub Actions regression test workflow.

## 2026-05-26
### Fixed
- Removed Anthropic image fetch
- Static image field on all 25 products
- Card and modal use direct src with fallback

### Added
- README.md
- CHANGELOG.md
