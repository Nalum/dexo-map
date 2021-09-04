package dexo

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type RSol float64
type LSol float64
type MSol float64

func (r RSol) String() string {
	return fmt.Sprintf("%.2f R_sol", r)
}

func (r *RSol) UnmarshalJSON(data []byte) error {
	var sol string
	err := json.Unmarshal(data, &sol)

	if err != nil {
		return err
	}

	a, err := strconv.ParseFloat(sol[:strings.LastIndex(sol, " ")], 64)
	*r = RSol(a)
	return err
}

func (r *RSol) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", r))
}

func (l LSol) String() string {
	return fmt.Sprintf("%.2f L_sol", l)
}

func (l *LSol) UnmarshalJSON(data []byte) error {
	var sol string
	err := json.Unmarshal(data, &sol)

	if err != nil {
		return err
	}

	a, err := strconv.ParseFloat(sol[:strings.LastIndex(sol, " ")], 64)
	*l = LSol(a)
	return err
}

func (l *LSol) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", l))
}

func (m MSol) String() string {
	return fmt.Sprintf("%.2f M_sol", m)
}

func (m *MSol) UnmarshalJSON(data []byte) error {
	var sol string
	err := json.Unmarshal(data, &sol)

	if err != nil {
		return err
	}

	a, err := strconv.ParseFloat(sol[:strings.LastIndex(sol, " ")], 64)
	*m = MSol(a)
	return err
}

func (m *MSol) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%s", m))
}
