# PDF 합치기

여러 PDF를 원하는 순서로 합치세요. 페이지 범위 선택부터 순서 변경까지, 파일 업로드 없이 브라우저에서 처리합니다.

Production: https://nanalab.kr/pdf-merge/

This is a new standalone app, not a modification or redirect of a legacy application. Buildless static HTML/CSS/JavaScript, hosted on GitHub Pages. Processing dependencies are vendored locally; source files and QR values are never uploaded. Publisher tags report ordinary page activity only.

## Supported scope

- 문서별 페이지 범위 선택
- 버튼으로 파일 순서 변경
- 원본 페이지 크기·회전 방향 유지

암호·전자서명 문서는 지원하지 않습니다. 입력 양식은 별도 동의를 받아 일반 페이지로 바꿀 수 있습니다.

## Validation

Install development dependencies with `npm install --ignore-scripts`, then run `npm test`. Synthetic test fixtures contain no personal material. Verify file ordering, output structure, error paths, and real browser downloads before deployment. Production has no Node.js dependency.

## Languages

Korean remains at the root. English, Japanese, Chinese, Spanish, German, French, Portuguese and Russian have static pages under `/en/`, `/ja/`, `/zh/`, `/es/`, `/de/`, `/fr/`, `/pt/`, `/ru/`. The footer links all nine versions. Each page has a self canonical and reciprocal hreflang links; the app sitemap lists all nine URLs. No language redirect discards the current file selection.

Edit `content/index.ko.html` for the Korean shell and `content/locales.json` for translations. Run `python scripts/build_locales.py` then `python scripts/check_locales.py`; use `--check` on the build script in CI. Shared processing and publisher scripts remain local to this independent app.
