SHELL := /bin/bash

.PHONY: build dev preview pages-sync test lint fmt clean

build:
	@mkdir -p dist
	@rsync -a --delete src/app/ dist/
	@echo "Built to dist/"

dev:
	@bash scripts/serve.sh src/app 8080

preview: build
	@bash scripts/serve.sh dist 8080

test:
	@echo "No automated tests yet. Consider adding content validators under scripts/."

lint:
	@echo "No linter configured. You can add Prettier/ESLint if desired."

fmt:
	@echo "No formatter configured."

clean:
	rm -rf dist

pages-sync:
	@rsync -a src/app/ docs/
	@echo "Synced src/app -> docs/ for GitHub Pages (set Pages source to 'main /docs')."
