package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func Static(files embed.FS) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Printf("Static Function Requested: %s", params.ByName("file"))

		if params.ByName("file") != "" {
			file, err := files.ReadFile(fmt.Sprintf("static%s", params.ByName("file")))

			if err != nil {
				log.Println(err)
				return
			}

			if strings.HasSuffix(params.ByName("file"), ".css") {
				w.Header().Add("content-type", "text/css")
			} else if strings.HasSuffix(params.ByName("file"), ".js") {
				w.Header().Add("content-type", "text/javascript")
			} else if strings.HasSuffix(params.ByName("file"), ".json") {
				w.Header().Add("content-type", "text/json")
			} else {
				w.Header().Add("content-type", "text/plain")
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
