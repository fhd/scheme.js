DIST_DIR=dist
SCM=dist/scheme.js
SCM_MIN=dist/scheme.min.js
INSTALL_PREFIX=/usr/local
LIB_DIR=$(INSTALL_PREFIX)/lib/schemejs
BIN_DIR=$(INSTALL_PREFIX)/bin
BIN=$(BIN_DIR)/schemejs

all: $(SCM) $(SCM_MIN)

$(DIST_DIR):
	mkdir $@

$(SCM): src/scheme.js $(DIST_DIR)
	cp $< $@

$(SCM_MIN): $(SCM) $(DIST_DIR)
	@if type uglifyjs >/dev/null; then \
		uglifyjs < $< > $@; \
	else \
		echo "Unable to find UglifyJS, not minifiying."; \
	fi

install: bin/schemejs $(SCM_MIN)
	mkdir -p $(LIB_DIR)
	mkdir -p $(BIN_DIR)
	cp $+ $(LIB_DIR)
	ln -fs $(LIB_DIR)/schemejs $(BIN_DIR)
	sed -i "s/..\/src\/scheme.js/..\/lib\/schemejs\/scheme.min.js/" $(BIN)
	chmod +x $(BIN)

uninstall:
	rm -rf $(LIB_DIR) $(BIN)

clean:
	rm -rf $(DIST_DIR)
