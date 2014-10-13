# output directories
CACHE_DIR := .cache/
BUILD_DIR := output/

# list of all directories that must be created
ALL_DIRS := $(addprefix $(BUILD_DIR),api tutorials public public/css public/css/plugins public/js public/img) $(CACHE_DIR)api

# the templates that impact every page
LAYOUT := build.js lib/markdown.js templates/layout.jade templates/includes/navigation.jade templates/includes/footer.jade

# the files lib/locals.js depends on
LOCALS := $(addprefix $(CACHE_DIR),issues.json weeklyIssues.json commits.json weeklyCommits.json downloads.json tags.json) lib/markdown.js

# the files dependend on for the contribute page
CONTRIBUTE_LOCALS := $(addprefix $(CACHE_DIR),newContributorIssues.json helpWantedIssues.json)

# dependencies of main.css
STYLUS := $(wildcard style/*.styl) $(wildcard style/components/*.styl) $(wildcard style/globals/*.styl) $(wildcard style/sections/*.styl)

# list of all tutorials, tutorials/%.md -> tutorials/%.html
TUTORIALS := $(wildcard tutorials/*.md)
TUTORIALS_HTML := $(patsubst %.md,%.html,$(TUTORIALS))

# include tags.mk, which is created dynamically by build.js
-include $(CACHE_DIR)tags.mk

# list of all html pages that are NOT api references
ALL_HTML := $(addprefix $(BUILD_DIR),404.html 500.html community.html contribute.html hapidays.html help.html index.html updates.html plugins.html $(TUTORIALS_HTML) tutorials/index.html)

# all images, images/% -> public/img/%
IMAGES := $(addprefix public/img/,$(notdir $(wildcard images/*)))

# all javascript, javascript/% -> public/js/%
JAVASCRIPT := $(addprefix public/js/,$(notdir $(wildcard javascript/*)))

# list of all other files, prefixed with BUILD_DIR (output/)
OTHERS := $(addprefix $(BUILD_DIR),public/css/main.css public/css/plugins/normalize.css $(JAVASCRIPT) $(IMAGES))

# build all the things
all: $(ALL_HTML) $(OTHERS)

# helper to make sure directories exist, since it's an ordered
# dependency, dates don't matter, so this only creates and never
# updates because of a change
$(ALL_DIRS):
	@mkdir -p $@

# generate the tags.mk file which contains one target that lists
# html files for all available API reference tags
$(CACHE_DIR)tags.mk: $(CACHE_DIR)tags.json
	./build.js tags.mk

# generate json files used by everything else
$(CACHE_DIR)%.json: lib/markdown.js | $(ALL_DIRS)
	./build.js $*.json

# link the newest api reference to index.html
$(BUILD_DIR)api/index.html: $(CACHE_DIR)tags.json | $(ALL_DIRS)
	@cd $(BUILD_DIR)api; ln -sf `ls -1 *.html | tail -n 1` index.html

# build api reference html
$(BUILD_DIR)api/%.html: $(CACHE_DIR)api/%.json templates/api.jade $(LAYOUT) | $(ALL_DIRS)
	./build.js api/$*.html

# link tutorials/getting-started.html to tutorials/index.html
$(BUILD_DIR)tutorials/index.html: | $(ALL_DIRS)
	@cd $(BUILD_DIR)tutorials; ln -sf getting-started.html index.html

# build tutorial html
$(BUILD_DIR)tutorials/%.html: templates/tutorial.jade $(TUTORIALS) $(LAYOUT) | $(ALL_DIRS)
	./build.js tutorials/$*.html

# index.html
$(BUILD_DIR)index.html: templates/index.jade index.md lib/community.js $(LOCALS) $(LAYOUT) | $(ALL_DIRS)
	./build.js index.html

# updates.html
$(BUILD_DIR)updates.html: templates/updates.jade $(CACHE_DIR)changelog.json $(LOCALS) $(LAYOUT) | $(ALL_DIRS)
	./build.js updates.html

# community.html
$(BUILD_DIR)community.html: templates/community.jade lib/community.js $(LAYOUT) | $(ALL_DIRS)
	./build.js community.html

# contribute.html
$(BUILD_DIR)contribute.html: templates/contribute.jade $(CONTRIBUTE_LOCALS) $(LAYOUT) | $(ALL_DIRS)
	./build.js contribute.html

$(BUILD_DIR)plugins.html: templates/plugins.jade lib/plugins.js $(LAYOUT) | $(ALL_DIRS)
	./build.js plugins.html

# all other html files, these have no dependencies other than
# layout and their own template
$(BUILD_DIR)%.html: templates/%.jade $(LAYOUT) | $(ALL_DIRS)
	./build.js $*.html

# copy directories to the output
$(BUILD_DIR)public/img/%: images/% | $(ALL_DIRS)
	cp -f $^ $(BUILD_DIR)public/img/

# minify and compress javascript, write results to output
$(BUILD_DIR)public/js/%: javascript/% | $(ALL_DIRS)
	./node_modules/.bin/uglifyjs2 $^ -c -m -o $(BUILD_DIR)public/js/$*

# just copy the normalize.css
$(BUILD_DIR)public/css/plugins/normalize.css: style/plugins/normalize.css | $(ALL_DIRS)
	cp -f $^ $(BUILD_DIR)public/css/plugins/normalize.css

# compile the stylus into main.css and copy to output
$(BUILD_DIR)public/css/main.css: $(STYLUS) | $(ALL_DIRS)
	./node_modules/.bin/stylus -c style/main.styl -o $(BUILD_DIR)public/css/

# force rebuild all the things. this forcibly refreshes all dynamic
# data, which will cause everything but static content pages to rebuild
bootstrap:
	./build.js downloads.json
	./build.js issues.json
	./build.js weeklyIssues.json
	./build.js commits.json
	./build.js weeklyCommits.json
	./build.js tags.json
	@$(MAKE)

# refresh download stats from npm
downloads:
	./build.js downloads.json
	@$(MAKE)

# github hooks, each target is a github event that
# forcibly refreshes the relevant information and rebuilds
# dependent static output
issues:
	./build.js downloads.json
	./build.js issues.json
	./build.js newContributorIssues.json
	./build.js helpWantedIssues.json
	./build.js weeklyIssues.json
	@$(MAKE)

push:
	./build.js downloads.json
	./build.js commits.json
	./build.js weeklyCommits.json
	./build.js changelog.json
	@$(MAKE)

create:
	./build.js downloads.json
	./build.js tags.json
	@$(MAKE)

# start the server, which also runs the file watcher
watch: all
	@node server.js

# clean \o/
clean:
	@rm -rf $(CACHE_DIR) $(BUILD_DIR)

.PHONY: all clean downloads issues push create
# blank .SECONDARY makes sure that all intermediate files are kept, i.e. the api json files
.SECONDARY:
