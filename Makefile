.PHONY: build deploy clean run
export CGO_ENABLED=0
export BLOCKFROST_KEY?=...

build: clean
	@packr2 build -o ./bin/dexo-map
	@rm -rf packrd main-packr.go dexo-map

run:
	@go build -o ./bin/dexo-map
	@./bin/dexo-map -blockfrost-key ${BLOCKFROST_KEY}

deploy: build
	@scp ./bin/dexo-map nalum@dexo-map.mallon.ie:/home/nalum/dexo-map
	@ssh root@dexo-map.mallon.ie 'systemctl stop dexo-map; mv /home/nalum/dexo-map /usr/bin/dexo-map; systemctl start dexo-map; rm -rf /tmp/cache/*;'
	@rm -rf packrd main-packr.go bin dexo-map

clean:
	@rm -rf packrd main-packr.go bin dexo-map
