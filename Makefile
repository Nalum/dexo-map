.PHONY: build deploy clean run
export CGO_ENABLED=0
export BLOCKFROST_KEY?=...

build: clean
	@go build -o ./bin/dexo-map

run: build
	@./bin/dexo-map -blockfrost-key ${BLOCKFROST_KEY}

deploy: build
	@ssh root@dexo-map.mallon.ie 'systemctl stop dexo-map'
	@scp ./bin/dexo-map root@dexo-map.mallon.ie:/usr/bin/dexo-map
	@ssh root@dexo-map.mallon.ie 'systemctl start dexo-map; rm -rf /tmp/cache/*;'

clean:
	@rm -rf bin dexo-map
