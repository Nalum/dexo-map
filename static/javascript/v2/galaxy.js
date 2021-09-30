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

// Minimum Star Radius allowed;
const minStarSize = new paper.Size(2,2);
// Scale will change to show zooming in/out
var scale = 7e-16;
const minZoom = 7e-16;
const maxZoom = 0.00012368155244843137;

// Messing around trying to figure out the zoom issue
var center = new paper.Point(0,0);
center.radial_distance = 0;
center.longitude = 0;
center.calculatePosition = function() {
	var point = new paper.Point(
		((this.radial_distance * scales.Parsec) * scale) * Math.sin(-this.longitude * (Math.PI / 180)) + galacticCenter.x,
		((-this.radial_distance * scales.Parsec) * scale) * Math.cos(this.longitude * (Math.PI / 180)) + galacticCenter.y
	);
	return point;
};

// Offset will be used to allow panning around
var galacticCenter = new paper.Point(0,0);
// This value allows us to set the alpha of the star based on it's luminosity
var maxLums = 0;
// Planet and Star count
var planetTotal = 0;
var starTotal = 0;
// Declare stars for later use
var stars;
var closestStar;
var currentStar;

// Setup an initial event to load the paper canvas
window.addEventListener("load", function() {
	paper.setup(galaxy);

	with (paper) {
		// Setup the view so that 0,0 is in the center of the canvas image
		view.translate(galaxy.width / 2, galaxy.height / 2);
		// Highlight the center so it's easier to see
		var centerCircle = Path.Ellipse({
			center: galacticCenter,
			radius: 10,
			strokeColor: 'white'
		});

		view.onMouseDown = function(event) {
			galaxy.className = "grabbing";
		};

		view.onMouseUp = function(event) {
			galaxy.className = "";
		};

		view.onMouseDrag = function(event) {
			// Unset currentStar when dragging to allow dragging to work
			currentStar = null;
			galacticCenter = galacticCenter.add(event.delta);
		};

		view.onFrame = function(event) {
			// If currentStar is set to a star we force galacticCenter to be offset from that point
			if (currentStar) {
				galacticCenter = galacticCenter.subtract(currentStar.calculatePosition());
			}

			// Assuming we have Stars we want to have them added back into the image if they were removed
			// due to being out of bounds.
			if (typeof stars !== "undefined") {
				Object.keys(stars).forEach(function(starID) {
					var pos = stars[starID].calculatePosition();

					if (paper.view.bounds.contains(pos) && stars[starID].item.parent === null) {
						stars[starID].item.addTo(paper.project);
					}
				});
			}
		}
	}

	var handleScroll = function (evt) {
		// Get the delta of our zoom to allow the decision of zooming in or out
		var delta = evt.wheelDelta
			? evt.wheelDelta / 40
			: evt.detail
				? -evt.detail
				: 0;

		// Are we zooming in or out?
		scale += delta >= 0
			? scale/2
			: -scale/2;

		// Check if we're between min and max zoom levels
		scale = scale >= maxZoom
			? maxZoom
			:scale <= minZoom
				? minZoom
				: scale;

		// recalculate the size and position of the stars based on the new scale
		Object.keys(function(starID) {
			stars[starID].calculatePosition();
			stars[starID].calculateSize();
		});

		// Stop the default action of scrolling from happening
		return evt.preventDefault() && false;
	};

	galaxy.addEventListener("DOMMouseScroll", handleScroll, false);
	galaxy.addEventListener("mousewheel", handleScroll, false);
});

function getRandomInclusive(min, max, int) {
	d = Math.random();
	v = 0;
	v = d >= min && d <= max
		? d
		: d < min
			? min
			: max;

	if (int) {
		min = Math.ceil(min);
		max = Math.floor(max);
		v = Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
	}

	return v;
}

// Load the Star Data
var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', '/stars', true);

// Process the Star data on successful load
req.addEventListener("load", function () {
	if (req.readyState == 4 && req.status == "200") {
		stars = JSON.parse(req.responseText);

		// Loop over the star data so that we can build the image.
		Object.keys(stars).forEach(function (starID) {
			// Getting the max brightness for use in calculating the alpha of the star
			if (stars[starID].luminosity > maxLums) {
				maxLums = stars[starID].luminosity;
			}

			// Add up the total number of planets
			planetTotal += stars[starID].planets.length;
			// Add up the total number of stars
			starTotal += 1;

			// calculatePosition is used to position the Star correctly relative to the
			// center of the galaxy and the center of the canvas.
			stars[starID].calculatePosition = function() {
				var point = new paper.Point(
					((this.radial_distance * scales.Parsec) * scale) * Math.sin(-this.longitude * (Math.PI / 180)) + galacticCenter.x,
					((-this.radial_distance * scales.Parsec) * scale) * Math.cos(this.longitude * (Math.PI / 180)) + galacticCenter.y
				);

				if (this.item) {
					this.item.position = point;
				}

				return point;
			};

			// calculateSize uses the radius of the star and multiplies it by the known radius of the sun (Sol).
			// It is also multiplied by the scale value to scale the star correctly.
			// minStarSize is returned if the Stars size is less than it at any given scale.
			stars[starID].calculateSize = function() {
				var radius = (scales.RSol * this.radius) * scale;
				var size = new paper.Size(radius, radius);
				var bounds = size.width > minStarSize.width ? size : minStarSize;

				if (this.item) {
					this.item.bounds = bounds;
				}

				return bounds;
			};

			// Here we are adding the Star to the canvas
			stars[starID].item = new paper.Path.Ellipse({
				center: stars[starID].calculatePosition(),
				radius: stars[starID].calculateSize()
			});

			// This is calculating the stars color depending on whether there is more than 1
			if (stars[starID].color.length > 1) {
				stars[starID].item.fillColor = {
					gradient: {
						stops: stars[starID].color,
						radial: true
					},
					origin: stars[starID].calculatePosition(),
					destination: stars[starID].item.bounds.rightCenter
				};
			} else {
				stars[starID].item.fillColor = stars[starID].color;
			}

			// For now if you click on the star it will log the ID to the console.
			// Want to do more here with selection/info/planet display
			stars[starID].item.onMouseUp = function() {
				console.log(this.star.star_id);
			};

			// Do more here but also need to increase the hitbox size to allow easier clicking
			stars[starID].item.onMouseEnter = function() {
				galaxy.className = "pointer";
			};

			stars[starID].item.onMouseLeave = function() {
				galaxy.className = "";
			};

			// onFrame is called 60 times a second (where possible) and is used to resize and
			// recalculate the position of the stars when the map is dragged or zoomed.
			stars[starID].item.onFrame = function(event) {
				// If the Star is no longer in the bounds of the canvas view let's
				// remove it to reduce the required resources.
				if (!this.isInside(paper.view.bounds)) {
					this.remove();
				}
			};

			// Add the Star as a reference to item
			stars[starID].item.star = stars[starID];

			// Loop over each Planet and set them up for later use.
			// Might be a better way of doing this.
			stars[starID].planets.forEach(function(planet) {
				// Parse the axis to a float as it is currently a string
				var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
				// Calculate the Planet Radius with current scale
				var radius = planetSizes[planet.size] * scale;
				// Create a size for later use
				var size = new paper.Size(radius, radius);
				// Calculate the Planets position
				var pos = stars[starID].item.position + new paper.Point((((scales.AU * semimajor_axis) * scale) * Math.LOG10E), 0);
				// Setup an orbit and assign it to the Planet
				planet.orbit = new paper.Path.Ellipse({
					center: stars[starID].item.position,
					radius: stars[starID].calculateSize() + size + (((scales.AU * semimajor_axis) * scale) * Math.LOG10E),
					strokeColor: planet.color,
					stokeWidth: 1
				});
				// Reference the Planet in the Orbit
				planet.orbit.planet = planet;
				// Setup the Planet on the orbit line
				planet.item = new paper.Path.Ellipse({
					center: pos,
					radius: size,
					fillColor: planet.color
				});
				// Reference the Planet
				planet.item.planet = planet;
				// Remove the Orbit and Planet from the image as we are zoomed out and cannot see them anyway.
				planet.orbit.remove();
				planet.item.remove();
				
				// V1 Calculations for reference.
				// var x = ((systemView.AU * semimajor_axis) * Math.LOG10E) + starSize + radius;
				// drawOrbit(ctx, x, radius/2, planet.color);
				// drawPlanet(ctx, x, 0, radius, planet, typeof planet.selected === "undefined" && i===systemItem ? true : planet.selected);
			});
		});

		document.getElementById("filter_star_total").innerHTML = starTotal;
		document.getElementById("filter_planet_total").innerHTML = planetTotal;
		populateSelects();
		document.getElementById("start").disabled = false;
		document.getElementById("start").innerHTML = "Start";
		// Hardcode an initial focus while working out the zoom movement issue
		currentStar = stars[330];
	}
});

req.send(null);