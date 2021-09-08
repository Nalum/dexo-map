package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gobuffalo/packr/v2"
	"github.com/julienschmidt/httprouter"
)

const policyID = "862cd06c4504de6114a29e0b863751ee84ad455493d43aeeb727d896"

var client = &http.Client{}

type Asset struct {
	Unit     string `json:"unit"`
	Quantity string `json:"quantity"`
}

func Stake(bfKey string, box *packr.Box) func(http.ResponseWriter, *http.Request, httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
		log.Println("Stake Function Requested")
		stake := params.ByName("stake")
		log.Printf("Stake Address: %s\n", stake)

		w.Header().Add("content-type", "text/json")
		w.Header().Add("cache-control", "public")
		w.Header().Add("cache-control", "max-age=300")

		if stake != "" && bfKey != "" {
			count := 100
			assets := []Asset{}
			page := 1

			for count == 100 {
				req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://cardano-mainnet.blockfrost.io/api/v0/accounts/%s/addresses/assets?page=%d", stake, page), nil)

				if err != nil {
					log.Println(err)
				}

				req.Header.Add("project_id", bfKey)
				resp, err := client.Do(req)

				if err != nil {
					log.Println(err)
				}

				data := []Asset{}
				err = json.NewDecoder(resp.Body).Decode(&data)

				if err != nil {
					log.Println(err)
				}

				for _, v := range data {
					if strings.HasPrefix(v.Unit, policyID) {
						assets = append(assets, v)
					}
				}

				count = len(data)
				page++
			}

			file, err := box.Find("json/stars.json")

			if err != nil {
				log.Println(err)
				return
			}

			starMap := map[int]interface{}{}
			err = json.Unmarshal(file, &starMap)

			if err != nil {
				log.Println(err)
				fmt.Fprintf(w, "error parsing the data")
				return
			}

			dataResp := []interface{}{}

			for _, v := range assets {
				req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://cardano-mainnet.blockfrost.io/api/v0/assets/%s", v.Unit), nil)

				if err != nil {
					log.Println(err)
				}

				req.Header.Add("project_id", bfKey)
				resp, err := client.Do(req)

				if err != nil {
					log.Println(err)
				}

				data := map[string]interface{}{}
				err = json.NewDecoder(resp.Body).Decode(&data)

				if err != nil {
					log.Println(err)
				}

				starID := 0

				if ocmd, ok := data["onchain_metadata"].(map[string]interface{}); ok {
					if sid, ok := ocmd["Host Star ID"].(float64); ok {
						starID = int(sid)
					}
				}

				if starID > 0 {
					dataResp = append(dataResp, starMap[starID])
				}
			}

			jsonResp, err := json.Marshal(dataResp)

			if err != nil {
				log.Println(err)
			}

			fmt.Fprintf(w, "%s", jsonResp)
		} else {
			log.Println("API Key Set:", bfKey == "", "Stake Address Provided:", stake == "")
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, `{"status": "error", "message": "Unable to query the system at this time"}`)
		}
	}
}
