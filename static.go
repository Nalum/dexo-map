package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

func Static(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Printf("Static Function Requested: %s", params.ByName("file"))

		if params.ByName("file") != "" {
			file, err := box.Find(params.ByName("file"))

			if err != nil {
				log.Println(err)
				return
			}

			mtype := mimetype.Detect(file)

			if params.ByName("file") == "/css/main.css" {
				w.Header().Add("content-type", "text/css")
			} else {
				w.Header().Add("content-type", mtype.String())
			}

			w.Header().Add("cache-control", "public")
			w.Header().Add("cache-control", "max-age=300")
			fmt.Fprintf(w, "%s", file)
		} else {
			log.Printf("Unable to find file: %s\n", params.ByName("file"))
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprintf(w, "404 Not Found")
		}
	}
}
