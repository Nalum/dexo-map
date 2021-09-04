package dexo

import (
	"encoding/json"
	"net/url"
)

type Planet struct {
	Name                string            `json:"name"`
	Size                string            `json:"size"`
	ResearchImpact      string            `json:"research_impact"`
	SemimajorAxis       string            `json:"semimajor_axis"`
	Composition         string            `json:"composition"`
	Satellites          int               `json:"satellites"`
	LargeSatellites     int               `json:"large_satellites"`
	Rings               string            `json:"rings"`
	RingsColor          string            `json:"rings_color"`
	Life                string            `json:"life"`
	Color               Colors            `json:"color"`
	BackgroundStarColor Colors            `json:"bg_star_color"`
	HostStar            Star              `json:"host_star"`
	ID                  int               `json:"planet_id"`
	PlanetaryPosition   PlanetaryPosition `json:"planetary_position"`
	ImageURL            url.URL           `json:"image_url"`
}

func (p *Planet) UnmarshalJSON(data []byte) error {
	type Doppelganger Planet
	tmp := struct {
		ImageURL string `json:"image_url"`
		*Doppelganger
	}{
		Doppelganger: (*Doppelganger)(p),
	}
	err := json.Unmarshal(data, &tmp)

	if err != nil {
		return err
	}

	imageURL, err := url.Parse(tmp.ImageURL)

	if err != nil {
		return err
	}

	p.ImageURL = *imageURL
	return nil
}
