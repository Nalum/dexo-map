package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

func Index(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		log.Println("Index Function Requested")
		file, err := box.Find("html/index.html")

		if err != nil {
			fmt.Println(err)
			return
		}

		w.Header().Add("content-type", "text/html")
		w.Header().Add("cache-control", "private")
		w.Header().Add("cache-control", "max-age=300")
		fmt.Fprintf(w, "%s", file)
	}
}

func Static(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Printf("Static Function Requested: %s", params.ByName("file"))

		if params.ByName("file") != "" {
			file, err := box.Find(params.ByName("file"))

			if err != nil {
				fmt.Println(err)
				return
			}

			mtype := mimetype.Detect(file)
			w.Header().Add("content-type", mtype.String())
			w.Header().Add("cache-control", "private")
			w.Header().Add("cache-control", "max-age=300")
			fmt.Fprintf(w, "%s", file)
		} else {
			log.Printf("Unable to find file: %s\n", params.ByName("file"))
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprintf(w, "404 Not Found")
		}
	}
}

func Stars(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Println("Stars Function Requested")
		file, err := box.Find("json/stars.json")

		if err != nil {
			fmt.Println(err)
			return
		}

		w.Header().Add("content-type", "text/json")
		w.Header().Add("cache-control", "private")
		w.Header().Add("cache-control", "max-age=300")

		if params.ByName("id") != "" {
			starMap := map[int]interface{}{}
			id, err := strconv.Atoi(params.ByName("id"))

			if err != nil {
				fmt.Fprintf(w, "%v is not a valid id", params.ByName("id"))
				return
			}

			err = json.Unmarshal(file, &starMap)

			if err != nil {
				fmt.Println(err)
				fmt.Fprintf(w, "error parsing the data")
				return
			}

			respJSON, err := json.Marshal(starMap[id])

			if err != nil {
				fmt.Println(err)
				fmt.Fprintf(w, "error parsing the data")
				return
			}

			fmt.Fprintf(w, "%s", respJSON)
		} else {
			fmt.Fprintf(w, "%s", file)
		}
	}
}

func main() {
	static := packr.New("static", "./static")
	router := httprouter.New()
	router.GET("/", Index(static))
	router.GET("/static/*file", Static(static))
	router.GET("/stars", Stars(static))
	router.GET("/stars/:id", Stars(static))
	log.Println("Starting HTTP Server")
	log.Fatal(http.ListenAndServe(":8080", router))
}
