package dexo

import "fmt"

type Star struct {
	Name                 string      `json:"name"`
	SpectralType         string      `json:"spectral_type"`
	Color                Colors      `json:"color"`
	EffectiveTemperature Temperature `json:"effective_temperature"`
	Radius               RSol        `json:"radius"`
	Luminosity           LSol        `json:"luminosity"`
	Mass                 MSol        `json:"mass"`
	PlanetCount          int         `json:"n_planets"`
	Region               string      `json:"region"`
	RadialDistance       Distance    `json:"radial_distance"`
	Longitude            Longitude   `json:"longitude"`
	Quadrant             string      `json:"quadrant"`
	Sector               int         `json:"sector"`
	HabitableZone        string      `json:"habitable_zone"`
	ID                   int         `json:"star_id"`
	Planets              []Planet    `json:"planets"`
}

func (s Star) String() string {
	return fmt.Sprintf(
		`
ID: %d
Name: %s
Colors: %s
No. Planets: %d
Temperature: %s
RadialDistance: %s
`,
		s.ID,
		s.Name,
		s.Color,
		s.PlanetCount,
		s.EffectiveTemperature,
		s.RadialDistance,
	)
}
