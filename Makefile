.PHONY: lint test format build

default: build format lint test

lint:
	yarn lint

test:
	yarn test

format:
	yarn format

build:
	yarn build-parser