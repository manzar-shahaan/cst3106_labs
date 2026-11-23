# cst3106_labs

Lab exercises for CST3106 — Internet Architecture and Web Development (Algonquin College, Fall 2026).

| Lab | What it is | How to view |
|-----|------------|-------------|
| lab3 | Personal resume page — semantic HTML with CSS (flex layout, dark-mode support) | Open `lab3/resume.html` in a browser |
| lab4 | Design system documentation for the portfolio project — colors, typography, and layout mock-ups | Read `lab4/design_system.md` (screenshots in `lab4/design-system-images/`) |
| lab5 | Yatzy game design system and static board mock-up — HTML/CSS/JS; loads header/footer partials with `fetch()` | Serve the repo root (see below), then open `/lab5/yatzy-mock-up/index.html` |
| lab6 | JavaScript game-logic classes for Yatzy — `Dice`, scoring engine, game state | Read the `.js` files in `lab6/` |
| lab7 | Express server that serves the mock-up and exposes a `/roll-dice` JSON endpoint | `cd lab7 && npm install && node express.js`, then open http://localhost:3000 |
| lab8 | Lab 7 extended with the implemented Yatzy game logic (dice, engine, game state) | `cd lab8 && npm install && node express.js`, then open http://localhost:3000 |

## Running locally

lab5's mock-up loads its header/footer via `fetch()`, so it needs a static server — from the repo root run:

```
python3 -m http.server
```

then open http://localhost:8000/lab5/yatzy-mock-up/index.html. The plain HTML/CSS pages (lab3) can be opened directly in a browser.

## Related

The course project lives at [manzar-shahaan/portfolio](https://github.com/manzar-shahaan/portfolio) and the finished Yatzy assignment at [manzar-shahaan/yatzy](https://github.com/manzar-shahaan/yatzy).
