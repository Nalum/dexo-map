package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

func Index(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		index, err := box.Find("index.html")

		if err != nil {
			fmt.Println(err)
			return
		}

		w.Header().Add("content-type", "text/html")
		fmt.Fprintf(w, "%s", index)
	}
}

func Stars(box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		stars, err := box.Find("stars.json")

		if err != nil {
			fmt.Println(err)
			return
		}

		w.Header().Add("content-type", "text/json")

		if params.ByName("id") != "" {
			starMap := map[int]interface{}{}
			id, err := strconv.Atoi(params.ByName("id"))

			if err != nil {
				fmt.Fprintf(w, "%v is not a valid id", params.ByName("id"))
				return
			}

			err = json.Unmarshal(stars, &starMap)

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
			fmt.Fprintf(w, "%s", stars)
		}
	}
}

func main() {
	static := packr.New("static", "./static")
	router := httprouter.New()
	router.GET("/", Index(static))
	router.GET("/stars", Stars(static))
	router.GET("/stars/:id", Stars(static))
	log.Fatal(http.ListenAndServe(":8080", router))
}
