package main

import (
	"embed"
	"flag"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

//go:embed static/*
var static embed.FS
var VERSION = "0.3.0"

func main() {
	var bfKey string
	flag.StringVar(&bfKey, "blockfrost-key", "", "The API Key required to interact with the Blockfrost API.")
	flag.Parse()

	router := httprouter.New()
	router.GET("/", IndexV2(static))
	router.GET("/v1", IndexV1(static))
	router.GET("/v2", IndexV2(static))
	router.GET("/v3", IndexV3(static))
	router.GET("/static/*file", Static(static))
	router.GET("/stake/:stake", Stake(bfKey, static))
	router.GET("/stars", Stars(static))
	router.GET("/stars/:id", Stars(static))

	log.Println("Starting HTTP Server")
	log.Fatal(http.ListenAndServe(":8080", router))
}
