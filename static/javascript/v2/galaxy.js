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

// Minimum Star Radius allowed
const minStarSize = new paper.Size(2,2);
// Scale will change to show zooming in/out
var scale = 7e-16;
const minZoom = 7e-16;
const planetaryZoom = 5e-13;
const maxZoom = 0.00012368155244843137;

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
var starSymbols = {};

// getParameterByName is used to set the currentStar var if either
// star or planet is set as a GET parameter e.g. ?star=991
function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results || !results[2]) return null;
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Setup an initial event to load the paper canvas
window.addEventListener("load", function() {
	paper.setup(galaxy);

	with (paper) {
		// Setup the view so that 0,0 is in the center of the canvas image
		view.translate(galaxy.width / 2, galaxy.height / 2);

		view.onResize = function() {
			view.translate(view.center.x, view.center.y);
		};

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
					var star = stars[starID];
					var pos = star.calculatePosition();

					if (paper.view.bounds.contains(pos) && star.item.parent === null) {
						star.item.addTo(paper.project);
					}

					stars[starID] = star;
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
		Object.keys(stars).forEach(function(starID) {
			var star = stars[starID];
			star.calculatePosition();
			star.calculateSize();
			stars[starID] = star;
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

		// Loop over the star data to create symbols for each star color
		Object.keys(stars).forEach(function (starID) {
			var star = stars[starID];
			var color = star.color.join("_");

			// Here we are adding the Star to the canvas
			if (typeof starSymbols[color] === "undefined") {
				var ellipse = new paper.Path.Ellipse({
					center: new paper.Point(0,0),
					radius: minStarSize
				});

				// This is calculating the stars color depending on whether there is more than 1
				if (star.color.length > 1) {
					ellipse.fillColor = {
						gradient: {
							stops: star.color,
							radial: true
						},
						origin: ellipse.position,
						destination: ellipse.bounds.rightCenter
					};
				} else {
					ellipse.fillColor = star.color;
				}

				starSymbols[color] = new paper.Symbol(ellipse);
			}
		});

		// Loop over the star data so that we can build the image
		Object.keys(stars).forEach(function (starID) {
			var star = stars[starID];
			var color = star.color.join("_");

			// Getting the max brightness for use in calculating the alpha of the star
			if (star.luminosity > maxLums) {
				maxLums = star.luminosity;
			}

			// Add up the total number of planets
			planetTotal += star.planets.length;
			// Add up the total number of stars
			starTotal += 1;

			// calculatePosition is used to position the Star correctly relative to the
			// center of the galaxy and the center of the canvas
			star.calculatePosition = function() {
				var point = new paper.Point(
					((this.radial_distance * scales.Parsec) * scale) * Math.sin(-this.longitude * (Math.PI / 180)) + galacticCenter.x,
					((-this.radial_distance * scales.Parsec) * scale) * Math.cos(this.longitude * (Math.PI / 180)) + galacticCenter.y
				);

				if (this.item) {
					this.item.setPosition(point);
				}

				return point;
			};

			// calculateSize uses the radius of the star and multiplies it by the known radius of the sun (Sol)
			// It is also multiplied by the scale value to scale the star correctly
			// minStarSize is returned if the Stars size is less than it at any given scale
			star.calculateSize = function() {
				var radius = (scales.RSol * this.radius) * scale;
				var size = radius > minStarSize.width ? new paper.Size(radius, radius) : minStarSize;

				if (this.item) {
					var bounds = new paper.Rectangle({
						center: this.item.position,
						size: size
					});

					if (!this.item.bounds.equals(bounds)) {
						this.item.setBounds(bounds);
					}
				}

				return size;
			};

			// Here we are adding the Star to the canvas
			star.item = starSymbols[color].place(star.calculatePosition());
			// star.item.onFrame = star.item.definition.item.onFrame;

			// For now if you click on the star it will log the ID to the console
			// Want to do more here with selection/info/planet display
			star.item.onMouseUp = function() {
				console.log(this.star.star_id);
			};

			// Do more here but also need to increase the hitbox size to allow easier clicking
			star.item.onMouseEnter = function() {
				galaxy.className = "pointer";
			};

			star.item.onMouseLeave = function() {
				galaxy.className = "";
			};

			// onFrame is called 60 times a second (where possible)
			star.item.onFrame = function(event) {
				// If the Star is no longer in the bounds of the canvas view let's
				// remove it to reduce the required resources
				if (!this.isInside(paper.view.bounds)) {
					this.remove();
				}
			};

			// Add the Star as a reference to item
			star.item.star = stars[starID];

			// Loop over each Planet and set them up for later use
			// Might be a better way of doing this
			// star.planets.forEach(function(planet, index) {
			// 	// Parse the axis to a float as it is currently a string
			// 	var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
			// 	// Calculate the Planet Radius with current scale
			// 	var radius = planetSizes[planet.size] * scale;
			// 	// Create a size for later use
			// 	var size = new paper.Size(radius, radius);
			// 	// Calculate the Planets position
			// 	var pos = star.item.position + new paper.Point((((scales.AU * semimajor_axis) * scale) * Math.LOG10E), 0);
			// 	// Setup an orbit and assign it to the Planet
			// 	planet.orbit = new paper.Path.Ellipse({
			// 		center: star.item.position,
			// 		radius: star.calculateSize() + size + (((scales.AU * semimajor_axis) * scale) * Math.LOG10E),
			// 		strokeColor: planet.color,
			// 		stokeWidth: 1
			// 	});
			// 	// Reference the Planet in the Orbit
			// 	planet.orbit.planet = planet;
			// 	// Setup the Planet on the orbit line
			// 	planet.item = new paper.Path.Ellipse({
			// 		center: pos,
			// 		radius: size,
			// 		fillColor: planet.color
			// 	});
			// 	// Reference the Planet
			// 	planet.item.planet = planet;
			// 	// Remove the Orbit and Planet from the image as we are zoomed out and cannot see them anyway
			// 	planet.orbit.remove();
			// 	planet.item.remove();
			// 	// V1 Calculations for reference.
			// 	// var x = ((systemView.AU * semimajor_axis) * Math.LOG10E) + starSize + radius;
			// 	// drawOrbit(ctx, x, radius/2, planet.color);
			// 	// drawPlanet(ctx, x, 0, radius, planet, typeof planet.selected === "undefined" && i===systemItem ? true : planet.selected);
			// 	star.planets[index] = planet;
			// });

			stars[starID] = star;
		});

		document.getElementById("filter_star_total").innerHTML = starTotal;
		document.getElementById("filter_planet_total").innerHTML = planetTotal;
		populateSelects();
		document.getElementById("start").disabled = false;
		document.getElementById("start").innerHTML = "Start";
		// Hardcode an initial focus while working out the zoom movement issue
		gpStar = getParameterByName("star");
		gpPlanet = getParameterByName("planet");

		if (gpStar) {
			currentStar = stars[gpStar];
		} else if (gpPlanet) {
			Object.keys(stars).forEach(function(starID) {
				stars[starID].planets.forEach(function(planet) {
					if (planet.planet_id == gpPlanet) {
						currentStar = stars[starID];
					}
				});
			});
		}
	}
});

req.send(null);