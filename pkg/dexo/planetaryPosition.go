package dexo

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type PlanetaryPosition struct {
	Position int
	Total    int
}

func (p PlanetaryPosition) String() string {
	return fmt.Sprintf("%d of %d", p.Position, p.Total)
}

func (p *PlanetaryPosition) UnmarshalJSON(data []byte) error {
	var pos string
	err := json.Unmarshal(data, &pos)

	if err != nil {
		return err
	}

	pt := strings.Split(pos, " ")
	p.Position, err = strconv.Atoi(pt[0])

	if err != nil {
		return err
	}

	p.Total, err = strconv.Atoi(pt[2])
	return err
}

func (p *PlanetaryPosition) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", p))
}
