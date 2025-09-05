SHELL := /bin/bash

.PHONY: build dev preview test lint fmt clean

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
