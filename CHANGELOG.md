# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-28

### Added
- **Core:** Intelligent Financial Dashboard with categorization and charting.
- **AI Integration:** Gemini 2.5 Flash powered chat with localized context and simulated actions.
- **Security:** Strict CSP, AES-GCM local encryption, non-extractable storage master key.
- **Offline First:** Service worker and IndexedDB offline queue for background sync.
- **Testing:** Playwright E2E and Vitest unit testing added.
- **Open Source:** Included standard Github community files (LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md).

### Fixed
- Recharts width(-1) warnings suppressed.
- Service Worker production console logging disabled.
- Playwright testing now routes to Express backend on completely isolated port.
- CORS logic strengthened for production environments.
