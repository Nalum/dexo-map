package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

func Index(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		log.Println("Index Function Requested")
		file, err := box.Find("html/index.html")

		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("content-type", "text/html")
		w.Header().Add("cache-control", "public")
		w.Header().Add("cache-control", "max-age=300")
		fmt.Fprintf(w, "%s", file)
	}
}
