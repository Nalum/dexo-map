package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

func main() {
	var bfKey string
	flag.StringVar(&bfKey, "blockfrost-key", "", "The API Key required to interact with the Blockfrost API.")
	flag.Parse()

	static := packr.New("static", "./static")

	router := httprouter.New()
	router.GET("/", IndexV2(static))
	router.GET("/v1", IndexV1(static))
	router.GET("/v2", IndexV2(static))
	router.GET("/static/*file", Static(static))
	router.GET("/stake/:stake", Stake(bfKey, static))
	router.GET("/stars", Stars(static))
	router.GET("/stars/:id", Stars(static))

	log.Println("Starting HTTP Server")
	log.Fatal(http.ListenAndServe(":8080", router))
}
