package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

func Stars(files embed.FS) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Println("Stars Function Requested")
		file, err := files.ReadFile("static/json/stars.json")

		if err != nil {
			log.Println(err)
			return
		}

		w.Header().Add("content-type", "text/json")
		w.Header().Add("cache-control", "public")
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
				log.Println(err)
				fmt.Fprintf(w, "error parsing the data")
				return
			}

			respJSON, err := json.Marshal(starMap[id])

			if err != nil {
				log.Println(err)
				fmt.Fprintf(w, "error parsing the data")
				return
			}

			fmt.Fprintf(w, "%s", respJSON)
		} else {
			fmt.Fprintf(w, "%s", file)
		}
	}
}
