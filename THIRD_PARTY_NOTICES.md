# Third-party notices

This app is original NaNa Lab work. Its locally bundled processing library is **pdf-lib 1.17.1**, used under the **MIT** license. Original copyright and permission notices are retained under [vendor/licenses/](vendor/licenses/). Version, upstream sources and the bundle SHA-256 are recorded in [vendor/manifest.json](vendor/manifest.json).

The upstream library source was not modified. The QR browser bundle, where applicable, was compiled with esbuild and an additional CommonJS export for the same testable API. Development and unused server dependencies may also have their notices included; their presence does not imply they execute in a browser.

- pdf-lib 1.17.1: MIT; git+https://github.com/Hopding/pdf-lib.git
- @pdf-lib/standard-fonts 1.0.0: MIT; https://github.com/Hopding/standard-fonts.git
- pako 1.0.11: (MIT AND Zlib); nodeca/pako
- @pdf-lib/upng 1.0.1: MIT; https://github.com/Hopding/upng
- tslib 1.14.1: 0BSD; https://github.com/Microsoft/tslib.git
