SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

STYLUS_FILES := public/css/main.styl $(shell node_modules/.bin/glob-cli public/css/**/*.styl)
JS_FILES := public/js/responsive-nav.js public/js/app.js
FILES := public/css/main.css public/js/app.min.js

all: $(FILES)

public/css/main.css: $(STYLUS_FILES)
	stylus -c public/css/main.styl

public/js/app.min.js: $(JS_FILES)
	uglifyjs -c --source-map public/js/app.min.js.map --source-map-url /public/js/app.min.js.map --source-map-root / -o $@ $(JS_FILES) 
