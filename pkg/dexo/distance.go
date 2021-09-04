package dexo

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type Distance float64

func (d Distance) String() string {
	return fmt.Sprintf("%.12f parsec", d)
}

func (d *Distance) UnmarshalJSON(data []byte) error {
	var dist string
	err := json.Unmarshal(data, &dist)

	if err != nil {
		return err
	}

	a, err := strconv.ParseFloat(dist[:strings.LastIndex(dist, " ")], 64)
	*d = Distance(a)
	return err
}

func (d *Distance) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", d))
}
