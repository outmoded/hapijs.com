SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)
DOCKER = docker-compose
EXEC = $(DOCKER) exec server

STYLUS_FILES := public/css/main.styl $(shell node_modules/.bin/glob-cli public/css/**/*.styl)
JS_FILES := public/js/responsive-nav.js public/js/app.js
FILES := public/css/main.css public/js/app.min.js

all: $(FILES)

public/css/main.css: $(STYLUS_FILES)
	stylus -c public/css/main.styl

public/js/app.min.js: $(JS_FILES)
	uglifyjs -c --source-map public/js/app.min.js.map --source-map-url /public/js/app.min.js.map --source-map-root / -o $@ $(JS_FILES)

clean:
	rm -rf public/css/main.css public/js/app.min.js public/js/app.min.js.map

# DOCKER COMMANDS
up:
	$(DOCKER) up -d
up-build: clean-docker
	$(DOCKER) build --no-cache --force-rm
	$(DOCKER) up -d
logs:
	$(DOCKER) logs -f server
down:
	$(DOCKER) down
mount:
	$(DOCKER) run --rm server /bin/bash
install:
	$(EXEC) npm install -S $(MOD)
remove:
	$(EXEC) npm remove -S $(MOD)
install-dev:
	$(EXEC) npm install -D $(MOD)
remove-dev:
	$(EXEC) npm remove -D $(MOD)
clean-docker:
	docker system prune -f
restart: down up logs