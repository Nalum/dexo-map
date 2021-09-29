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
		view.translate(galaxy.width / 2, galaxy.height / 2);
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
			currentStar = null;
			galacticCenter = galacticCenter.add(event.delta);
		};

		view.onFrame = function(event) {
			if (currentStar) {
				galacticCenter = galacticCenter.subtract(currentStar.calculatePosition());
			}

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
		var delta = evt.wheelDelta
			? evt.wheelDelta / 40
			: evt.detail
				? -evt.detail
				: 0;
		scale += delta >= 0
			? scale/2
			: -scale/2;
		scale = scale >= maxZoom
			? maxZoom
			:scale <= minZoom
				? minZoom
				: scale;
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

req.addEventListener("load", function () {
	if (req.readyState == 4 && req.status == "200") {
		stars = JSON.parse(req.responseText);

		Object.keys(stars).forEach(function (starID) {
			if (stars[starID].luminosity > maxLums) {
				maxLums = stars[starID].luminosity;
			}

			planetTotal += stars[starID].planets.length;
			starTotal += 1;

			stars[starID].calculatePosition = function() {
				var point = new paper.Point(
					((this.radial_distance * scales.Parsec) * scale) * Math.sin(-this.longitude * (Math.PI / 180)) + galacticCenter.x,
					((-this.radial_distance * scales.Parsec) * scale) * Math.cos(this.longitude * (Math.PI / 180)) + galacticCenter.y
				);
				return point;
			};

			stars[starID].calculateSize = function() {
				var radius = (scales.RSol * this.radius) * scale;
				var size = new paper.Size(radius, radius);
				return size.width > minStarSize.width ? size : minStarSize;
			};

			stars[starID].item = new paper.Path.Ellipse({
				center: stars[starID].calculatePosition(),
				radius: stars[starID].calculateSize()
			});

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

			stars[starID].item.onMouseUp = function() {
				console.log(this.star.star_id);
			};

			stars[starID].item.onMouseEnter = function() {
				galaxy.className = "pointer";
			};

			stars[starID].item.onMouseLeave = function() {
				galaxy.className = "";
			};

			stars[starID].item.onFrame = function(event) {
				var pos = this.star.calculatePosition();
				this.setPosition(pos);
				var bounds = new paper.Rectangle({
					center: pos,
					size: this.star.calculateSize()
				});

				if (!this.bounds.equals(bounds)) {
					this.set({bounds: bounds});
				}

				if (!this.isInside(paper.view.bounds)) {
					this.remove();
				} else {
					if (scale > 9.6626212850337e-7) {
						var that = this;
						stars[this.star.star_id].planets.forEach(function(planet) {
							if (planet.orbit.parent === null) {
								planet.orbit.addTo(that);
								console.log(planet);
							}

							if (planet.item.parent === null) {
								planet.item.addTo(that);
								console.log(planet);
							}
						});
					}
				}
			};

			stars[starID].item.star = stars[starID];

			stars[starID].planets.forEach(function(planet) {
				var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
				var radius = planetSizes[planet.size] * scale;
				var size = new paper.Size(radius, radius);
				var pos = stars[starID].item.position + new paper.Point((((scales.AU * semimajor_axis) * scale) * Math.LOG10E), 0);
				planet.orbit = new paper.Path.Ellipse({
					center: stars[starID].item.position,
					radius: stars[starID].calculateSize() + size + (((scales.AU * semimajor_axis) * scale) * Math.LOG10E),
					strokeColor: planet.color,
					stokeWidth: 1
				});
				planet.item = new paper.Path.Ellipse({
					center: pos,
					radius: size,
					fillColor: planet.color
				});
				planet.orbit.planet = planet;
				planet.item.planet = planet;
				planet.orbit.remove();
				planet.item.remove();
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
		currentStar = stars[330];
	}
});

req.send(null);