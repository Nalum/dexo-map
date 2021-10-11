// These constants define colors to be used in the drawing of the Galaxy
const base03 = "#002b36";
const base02 = "#073642";
const base01 = "#586e75";
const base00 = "#657b83";
const base0 = "#839496";
const base1 = "#93a1a1";
const base2 = "#eee8d5";
const base3 = "#fdf6e3";
const yellow = "#b58900";
const orange = "#cb4b16";
const red = "#dc322f";
const magenta = "#d33682";
const violet = "#6c71c4";
const blue = "#268bd2";
const cyan = "#2aa198";
const green = "#859900";

// Galaxy canvas
const galaxy = document.getElementById("galaxy");

// These constants define the scales at which things are drawn
const scales = {
	"REarth": 6371.00,
	"RSol": 695508.00,
	"AU": 149597900.00,
	"Parsec": 30856780000000.00
};

// These constants define the Planet sizes relative to scales.REarth
const planetSizes = {
	"XS": scales.REarth*0.5,
	"S": scales.REarth*1.0,
	"M": scales.REarth*3.0,
	"L": scales.REarth*6.0,
	"XL": scales.REarth*10.0
};

// Position of Planet indicated by a Letter
const positionLetter = [
	"a", "b", "c",
	"d", "e", "f",
	"g", "h", "q",
	"x", "z"
];

// Minimum Radius allowed
const minSize = new paper.Size(4,4);
// Scale will change to show zooming in/out
const minZoom = 7e-16;
const maxZoom = 1;