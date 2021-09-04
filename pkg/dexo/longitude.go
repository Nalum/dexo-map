package dexo

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type Longitude float64

func (l Longitude) String() string {
	return fmt.Sprintf("%.12f deg", l)
}

func (l *Longitude) UnmarshalJSON(data []byte) error {
	var lgt string
	err := json.Unmarshal(data, &lgt)

	if err != nil {
		return err
	}

	a, err := strconv.ParseFloat(lgt[:strings.LastIndex(lgt, " ")], 64)
	*l = Longitude(a)
	return err
}

func (l *Longitude) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", l))
}
