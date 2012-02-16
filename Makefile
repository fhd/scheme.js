DIST_DIR=dist
SCM=dist/scheme.js
INSTALL_PREFIX=/usr/local
LIB_DIR=$(INSTALL_PREFIX)/lib/schemejs
BIN_DIR=$(INSTALL_PREFIX)/bin
BIN=$(BIN_DIR)/schemejs

all: $(SCM)

$(DIST_DIR):
	mkdir $(DIST_DIR)

$(SCM): src/scheme.js $(DIST_DIR)
	cp $< $(SCM)

install: repl/schemejs $(SCM)
	mkdir -p $(LIB_DIR)
	mkdir -p $(BIN_DIR)
	cp $+ $(LIB_DIR)
	ln -fs $(LIB_DIR)/schemejs $(BIN_DIR)
	sed -i "s/..\/src/..\/lib\/schemejs/" $(BIN)
	chmod +x $(BIN)

uninstall:
	rm -rf $(LIB_DIR) $(BIN)

clean:
	rm -rf $(DIST_DIR)
