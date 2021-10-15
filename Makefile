develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

start:
	webpack-dev-server

