package dexo

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type Temperature int

func (t Temperature) String() string {
	return fmt.Sprintf("%d K", t)
}

func (t *Temperature) UnmarshalJSON(data []byte) error {
	var temp string
	err := json.Unmarshal(data, &temp)

	if err != nil {
		return err
	}

	a, err := strconv.Atoi(temp[:strings.LastIndex(temp, " ")])
	*t = Temperature(a)
	return err
}

func (t *Temperature) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", t))
}
