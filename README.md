# More Homes, Fewer People — Xiaoliuqiu data story

戶增人減與急遽老化：小琉球需重新設計社區支持系統

A bilingual (EN / 中文) scrollytelling site built **only with D3.js v7**. Every chart animates as you scroll through its story steps.

| Chapter | Chart | File | Animation |
|---|---|---|---|
| 1 Fewer people, more homes | Population vs household index, 1990–2024 | `js/ch1-trend.js` | lines draw themselves, gap fills in |
| 2 Micro-households | Persons per household by village, 2024 | `js/ch2-villages.js` | bars grow, then morph into a zoomed dot plot |
| 3 Fading children's voices | Population pyramid 2014 → 2024 | `js/ch3-pyramid.js` | plays every year 2014 → 2024 |
| 4 Dependency burden | Dependency ratio × social welfare (connected scatter) | `js/ch4-welfare.js` | trajectory drawn year by year |
| 5 Squeezed budgets (optional) | FY2023 vs FY2024 expenditure (grouped bar) | `js/ch5-budget.js` | bars grow, % change appears |

## Run it

No build step is needed. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

D3 is in `js/vendor/`, so the page also works offline.

## Data

The data comes from the cleaned Google Sheet **115-1-資料清理_解答版**, based on the Liuqiu Township Statistical Yearbook 2024 (ROC 113).

- `data/source/*.csv`: the tidy sheets exported from that spreadsheet (yearly, villages, age long table, finance long table)
- `scripts/build-data.js`: turns them into `js/data.js` and the downloadable `data/*.csv`

After you change anything in `data/source/`, run `node scripts/build-data.js`.

These are the groupings used:
- **Dependency ratio** = (0–14 + 65+) ÷ 15–64 × 100
- **Social welfare** = social relief + welfare services + employment + health + social insurance (final expenditure)
- **Economic development** = agriculture + industry + transport + other economic services
- **General administration** = legislative + administrative + civil affairs + finance
- **Community & environment** = community development + environmental protection
- **Education & culture** = education + culture
- **Pensions & other** = retirement & pensions + interest + debt service + second reserve + other

## Fonts

The display font is `Botch.otf` and the text font is `AcuminVariableConcept.otf`, both in the repo root. Chinese text falls back to Noto Sans TC from Google Fonts.
