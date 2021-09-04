package dexo

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Colors []string

func (c Colors) String() string {
	return strings.Join(c, " ")
}

func (c *Colors) UnmarshalJSON(data []byte) (err error) {
	var color string
	err = json.Unmarshal(data, &color)

	if err != nil {
		return
	}

	colorList := strings.Split(color, " ")
	*c = append(*c, colorList...)
	return
}

func (c *Colors) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", c))
}
