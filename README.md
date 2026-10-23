# FSM Study Kit

Study tools for **FSM – Financial & Supply Chain Management** (formerly CAB5), Hanze IBS.
Exam: 70% Managerial Finance + 30% Supply Chain Management.

Two separate websites:

| Site | Folder | What it does |
|---|---|---|
| **Practice** | `practice/` | Questions generated fresh each time (new numbers, wording, layout, question type), mastery tracking, mistake review, timed exam simulation |
| **Study Guide** | `guide/` | CodePath-style course site: what to read per week, notes, worked examples, glossary, formula sheet, and a reader for your own textbook PDFs |

## Links (after GitHub Pages is on)

- Practice: `https://rodrisap.github.io/CAB5/practice/`
- Study Guide: `https://rodrisap.github.io/CAB5/guide/`

Turn on GitHub Pages: repo **Settings → Pages → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**.

## Open locally
Double-click `index.html` (or `practice/index.html` / `guide/index.html`). No install needed.
Note: the book reader works best on the hosted site (some browsers block local storage for files opened from disk).

## Tests
```
node tests/run-tests.js
```
Fuzzes every question generator (200 versions each) and checks known answers from the seminar slides and Excel files.

## Notes
- Progress is saved in your browser (export/import in Practice → Settings).
- Your textbook PDFs are stored only in your own browser and are never uploaded.
- No textbook text is included in this repo; all notes are written in our own words.

## Deploying updates
Script and stylesheet tags carry a `?v=` version so browsers fetch fresh files after each push. Bump it with:
`V=$(date +%Y%m%d%H%M); sed -i -E "s#(src|href)=\"((\.\./)?[A-Za-z0-9_./-]+\.(js|css))(\?v=[0-9]+)?\"#\1=\"\2?v=$V\"#g" guide/index.html practice/index.html practice/case.html index.html`
