# Marketing Quiz / Case Study Prompt Editor

A lightweight, dependency-free prompt editor that generates marketing case-study problems and answer templates in Japanese, following your constraints (plain language, recall and availability thinking, profitability focus) and strict output format.

## Quick Start

- Fastest: run `make dev` and your browser will open at `http://localhost:8080`.
- Or open `src/app/index.html` directly in a browser (no server needed).
- For WordPress, copy the content of `examples/wp-embed.html` into an HTML block.

## Project Structure

- `src/app/` — self-contained HTML/CSS/JS editor.
- `docs/` — design blueprint and content rules.
- `examples/` — embeddable single-file demo for WordPress.
- `scripts/` — helper scripts (local server, etc.).

## Makefile

- `make dev` — serves `src/app/` at `http://localhost:8080` and auto-opens the browser.
- `make build` — copies `src/app` to `dist/`.
- `make preview` — serves `dist/` at `http://localhost:8080`.
- `make lint` / `make fmt` — placeholders; add your tools if needed.

## Notes

- No external packages are required.
- The editor enforces: no jargon, recall/ease-of-buy thinking hints, and profitability as a required objective.
