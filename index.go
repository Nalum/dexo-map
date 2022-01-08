package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func IndexV1(files embed.FS) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		log.Println("Index Function Requested")
		file, err := files.ReadFile("static/html/v1/index.html")

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

func IndexV2(files embed.FS) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		log.Println("Index Function Requested")
		file, err := files.ReadFile("static/html/v2/index.html")

		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("content-type", "text/html")
		w.Header().Add("cache-control", "public")
		w.Header().Add("cache-control", "max-age=300")
		response := string(file)
		response = strings.Replace(response, "{VERSION}", VERSION, 1)
		fmt.Fprintf(w, "%s", response)
	}
}

func IndexV3(files embed.FS) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		log.Println("Index Function Requested")
		file, err := files.ReadFile("static/html/v3/index.html")

		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("content-type", "text/html")
		w.Header().Add("cache-control", "public")
		w.Header().Add("cache-control", "max-age=300")
		response := string(file)
		response = strings.Replace(response, "{VERSION}", VERSION, 1)
		fmt.Fprintf(w, "%s", response)
	}
}
