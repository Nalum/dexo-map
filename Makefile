.PHONY: build deploy clean run
export CGO_ENABLED=0
export BLOCKFROST_KEY?=...

build: clean
	@go build -o ./bin/dexo-map

run: build
	@./bin/dexo-map -blockfrost-key ${BLOCKFROST_KEY}

deploy: build
	@scp ./bin/dexo-map nalum@dexo-map.mallon.ie:/home/nalum/dexo-map
	@ssh root@dexo-map.mallon.ie 'systemctl stop dexo-map; mv /home/nalum/dexo-map /usr/bin/dexo-map; systemctl start dexo-map; rm -rf /tmp/cache/*;'

clean:
	@rm -rf bin dexo-map
