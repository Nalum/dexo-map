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
const minSize = new paper.Size(3,3);
// Scale will change to show zooming in/out
const minZoom = 7e-16;
const maxZoom = 1;
var scale = minZoom;
var drawSystem = false;
var dragging = false;
var scaleText;
var scaleTextPoint;

// Offset will be used to allow panning around
var galacticCenter = new paper.Point(0,0);
// This value allows us to set the alpha of the star based on it's luminosity
var maxLums = 0;
// Planet and Star count
var planetTotal = 0;
var starTotal = 0;
// Declare stars for later use
var stars;
var currentStar;
var currentPlanet;
var starSymbols = {};
// Setup 3 layers for use in the project
// This layer will hold all Stars
var galaxyLayer;
// This layer will hold all Planets
var systemLayer;
// This layer will hold UI elements
var uiLayer;

// getParameterByName is used to set the currentStar var if either
// star or planet is set as a GET parameter e.g. ?star=991
function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results || !results[2]) return null;
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// setStarSelect will change the multiselect star list to have only 1 selected
// star based on the ID passed in
function setStarSelect(starID) {
	var starSelect = document.getElementById("filter_star_star");
	starSelect.value = "--";

	starSelect.childNodes.forEach(function(option) {
		if (option.value.includes("|"+starID+"|")) {
			option.selected = true;
		}
	});

	starPercentCalc();
}

// Calculate the Percentage of Stars Selected against the Total
function starPercentCalc() {
	var count = document.getElementById("filter_star_count");
	var percent = document.getElementById("filter_star_percent");

	count.innerHTML = document.getElementById("filter_star_star").selectedOptions.length;
	percent.innerHTML = ((document.getElementById("filter_star_star").selectedOptions.length / starTotal) * 100).toFixed(4);
}

function setCurrentStar(star) {
	systemLayer.removeChildren();
	currentStar = star;
	currentPlanet = null;
	document.getElementById('planetary_position').value = 0;
	document.getElementById('planetary_position').max = currentStar.planets.length;
	setStarSystemInfo();
}

function setStarSystemInfo() {
	document.getElementById("star_name").innerHTML = currentStar.name;
	document.getElementById("star_id").innerHTML = " #" + currentStar.star_id;
	document.getElementById("star_no_planets").innerHTML = currentStar.n_planets;
	document.getElementById("star_effective_temperature").innerHTML = currentStar.effective_temperature;
	document.getElementById("star_luminosity").innerHTML = currentStar.luminosity;
	document.getElementById("star_mass").innerHTML = currentStar.mass;
	document.getElementById("star_quadrant").innerHTML = currentStar.quadrant;
	document.getElementById("star_region").innerHTML = currentStar.region;
	document.getElementById("star_sector").innerHTML = currentStar.sector;
	document.getElementById("star_spectral_type").innerHTML = currentStar.spectral_type;
	document.getElementById("star_color").innerHTML = currentStar.color.join(", ");
	document.getElementById("star_habitable_zone").innerHTML = currentStar.habitable_zone;
	document.getElementById("star_longitude").innerHTML = currentStar.longitude;
	document.getElementById("star_radial_distance").innerHTML = currentStar.radial_distance;
	document.getElementById("star_radius").innerHTML = currentStar.radius;
}

function setCurrentPlanet(index) {
	if (index > 0) {
		currentPlanet = currentStar.planets[index-1];
		setPlanetInfo();
	} else {
		currentPlanet = null;
	}
}

function setPlanetInfo() {
	document.getElementById("planet_name").innerHTML = currentStar.name + "-" + 
		positionLetter[parseInt(currentPlanet.planetary_position.split(" ")[0])-1];
	document.getElementById("planet_id").innerHTML = " #" + currentPlanet.planet_id;
	document.getElementById("planet_image").src = currentPlanet.image_url.Scheme + "://" + currentPlanet.image_url.Host + currentPlanet.image_url.Path;
	document.getElementById("planet_background_star_color").innerHTML = currentPlanet.bg_star_color;
	document.getElementById("planet_color").innerHTML = currentPlanet.color;
	document.getElementById("planet_composition").innerHTML = currentPlanet.composition;
	document.getElementById("planet_large_satellites").innerHTML = currentPlanet.large_satellites;
	document.getElementById("planet_life").innerHTML = currentPlanet.life == "" ? "None" : currentPlanet.life;
	document.getElementById("planet_research_impact").innerHTML = currentPlanet.research_impact;
	document.getElementById("planet_rings").innerHTML = currentPlanet.rings == "" ? "None" : currentPlanet.rings + " (" + currentPlanet.rings_color + ")";
	document.getElementById("planet_satellites").innerHTML = currentPlanet.satellites;
	document.getElementById("planet_size").innerHTML = currentPlanet.size;
	document.getElementById("planet_semimajor_axis").innerHTML = currentPlanet.semimajor_axis;
	document.getElementById("planet_planetary_position").innerHTML = currentPlanet.planetary_position;
	document.getElementById("planet_owned").innerHTML = typeof currentPlanet.owned === "undefined" ? "No" : currentPlanet.owned ? "Yes" : "No";
}

function addSystem() {
	document.getElementById("planet_controls").className = "";
	// recalculate the size and position of the stars based on the new scale
	Object.keys(stars).forEach(function(starID) {
		var star = stars[starID];
		star.calculatePosition();
		star.calculateSize();

		if (galaxyLayer.getChildren().length == 1) {
			if (star.star_id == currentStar.star_id) {
				star.planets.forEach(function(planet) {
					if (!planet.orbit.parent) {
						planet.orbit.addTo(systemLayer);
					}

					if (!planet.item.parent) {
						planet.item.addTo(systemLayer);
					}
				});
			}
		} else {
			systemLayer.removeChildren();
			document.getElementById("planet_controls").className = "hidden";
		}

		stars[starID] = star;
	});
}

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

function togglePanel(clicked, other, panel1, panel2) {
	if (panel1.className == "hidden") {
		clicked.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&raquo;";
			}
		});

		other.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&laquo;";
			}
		});

		panel1.className = "";
		panel2.className = "hidden";
	} else {
		clicked.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&laquo;";
			}
		});

		other.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&laquo;";
			}
		});

		panel1.className = "hidden";
		panel2.className = "hidden";
	}
}

// Setup an initial event to load the paper canvas
window.addEventListener("load", function() {
	paper.setup(galaxy);

	with (paper) {
		galaxyLayer = new Layer({
			name: "stars"
		});
		project.addLayer(galaxyLayer);
		systemLayer = new Layer({
			name: "planets"
		});
		project.addLayer(systemLayer);
		uiLayer = new Layer({
			name: "ui"
		});
		project.addLayer(uiLayer);
		// Setup the view so that 0,0 is in the center of the canvas image
		view.translate(galaxy.width / 2, galaxy.height / 2);

		scaleTextPoint = new Point(
			view.getBounds().x + 15,
			view.getBounds().y + view.getBounds().height - 15
		);
		scaleText = new PointText(scaleTextPoint);
		scaleText.fillColor = base3;
		scaleText.shadowColor = base02;
		scaleText.shadowBlur = 2;
		scaleText.content = "Current Scale Kilometers 1:" + scale;
		scaleText.addTo(uiLayer);

		view.onResize = function() {
			view.translate(view.center.x, view.center.y);
			scaleTextPoint = new Point(
				view.getBounds().x + 15 + scaleText.getBounds().getSize().width/2,
				view.getBounds().y + view.getBounds().height - 15
			);
			scaleText.setPosition(scaleTextPoint);
		};

		view.onMouseDown = function(event) {
			galaxy.className = "grabbing";
			dragging = true;
		};

		view.onMouseUp = function(event) {
			galaxy.className = "";
			dragging = false;
		};

		view.onMouseDrag = function(event) {
			galacticCenter = galacticCenter.add(event.delta);
		};

		view.onFrame = function(event) {
			// If currentStar is set to a star we force galacticCenter to be offset from that point
			if (currentStar && !dragging) {
				galacticCenter = galacticCenter.subtract(currentStar.calculatePosition());
			}

			if (paper.project.getItem().getChildren().length === 1) {
				drawSystem = true;
			} else {
				drawSystem = false;
			}

			// Assuming we have Stars we want to have them added back into the image if they were removed
			// due to being out of bounds.
			if (typeof stars !== "undefined") {
				Object.keys(stars).forEach(function(starID) {
					var star = stars[starID];
					var pos = star.calculatePosition();

					if (paper.view.bounds.contains(pos) && star.item.parent === null) {
						star.calculateSize();
						star.item.addTo(galaxyLayer);
					}

					stars[starID] = star;
				});

				addSystem();

				systemLayer.getChildren().forEach(function(item) {
					if (item.planet) {
						if (!dragging) {
							item.planet.orbit.getBounds().setSize(item.planet.calculateOrbitalPath());
						}

						item.planet.orbit.setPosition(item.planet.star.calculatePosition());
						item.planet.item.setPosition(item.planet.orbit.getFirstSegment().getPoint());
						item.planet.item.getBounds().setSize(item.planet.calculateSize());
					}
				});
			}

			if (currentPlanet && !dragging) {
				galacticCenter = galacticCenter.subtract(currentPlanet.orbit.getFirstSegment().getPoint());
			}

			scaleText.content = "Current Scale Kilometers 1:" + scale;
			scaleTextPoint = new Point(
				view.getBounds().x + 15 + scaleText.getBounds().getSize().width/2,
				view.getBounds().y + view.getBounds().height - 15
			);
			scaleText.setPosition(scaleTextPoint);
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

		// Stop the default action of scrolling from happening
		return evt.preventDefault() && false;
	};

	galaxy.addEventListener("DOMMouseScroll", handleScroll, false);
	galaxy.addEventListener("mousewheel", handleScroll, false);
});

// Load the Star Data
var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', '/stars', true);

// Process the Star data on successful load
req.addEventListener("load", function () {
	if (req.readyState == 4 && req.status == "200") {
		stars = JSON.parse(req.responseText);
		var filterStarStar = document.getElementById("filter_star_star");
		var starSystemID = document.getElementById("star_system_id");

		// Loop over the star data to create symbols for each star color
		Object.keys(stars).forEach(function (starID) {
			var star = stars[starID];
			var color = star.color.join("_");

			// Here we are adding the Star to the canvas
			if (typeof starSymbols[color] === "undefined") {
				var ellipse = new paper.Path.Ellipse({
					center: new paper.Point(0,0),
					radius: minSize
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

					if (galaxyLayer.getChildren().length === 1 && drawSystem && this.star_id === currentStar.star_id) {
						if (this.calculateHabitableZoneRadius()[0] !== this.habitableZoneStart.getBounds().getSize().width) {
							if (this.habitableZone) {
								this.habitableZone.remove();
							}

							this.habitableZoneStart.getBounds().setSize(new paper.Size(this.calculateHabitableZoneRadius()[0]));
							this.habitableZoneStart.setPosition(point);
							this.habitableZoneEnd.getBounds().setSize(new paper.Size(this.calculateHabitableZoneRadius()[1]));
							this.habitableZoneEnd.setPosition(point);
							this.habitableZone = this.habitableZoneEnd.exclude(this.habitableZoneStart);
							this.habitableZone.addTo(systemLayer);
							this.habitableZone.fillColor.setAlpha(0.1);
						}

						this.habitableZone.setPosition(point);
					}
				}

				return point;
			};

			// calculateSize uses the radius of the star and multiplies it by the known radius of the sun (Sol)
			// It is also multiplied by the scale value to scale the star correctly
			// minSize is returned if the Stars size is less than it at any given scale
			star.calculateSize = function() {
				var radius = (scales.RSol * this.radius) * scale;
				var size = radius > minSize.width ? new paper.Size(radius, radius) : minSize;

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
			star.item.addTo(galaxyLayer);

			// Calculate Habitable Zone radius
			star.calculateHabitableZoneRadius = function() {
				var zoneStart = parseFloat(this.habitable_zone.split(" - ")[0]);
				var zoneEnd = parseFloat(this.habitable_zone.split(" - ")[1]);
				var zoneStartSize = ((scales.AU * zoneStart) * scale) + this.calculateSize().width;
				var zoneEndSize = ((scales.AU * zoneEnd) * scale) + this.calculateSize().width;
				return [zoneStartSize, zoneEndSize]
			};
			// Setup Habitable Zone for display
			star.habitableZoneStart = new paper.Path.Ellipse({
				center: star.calculatePosition(),
				radius: star.calculateHabitableZoneRadius()[0],
				fillColor: green
			});
			star.habitableZoneEnd = new paper.Path.Ellipse({
				center: star.calculatePosition(),
				radius: star.calculateHabitableZoneRadius()[1],
				fillColor: green
			});
			star.habitableZoneStart.remove();
			star.habitableZoneEnd.remove();

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
				// If the Star is no longer in the bounds of the canvas view let's remove it
				if (!this.isInside(paper.view.bounds) && !drawSystem) {
					this.remove();
				}
			};

			// Loop over each Planet and set them up for later use
			// Might be a better way of doing this
			star.planets.forEach(function(planet, index) {
				planet.star = star;
				planet.rotation = getRandomInclusive(0.1, 1.0);

				planet.calculateSize = function() {
					var radius = planetSizes[this.size] * scale;
					return minSize.width > radius ? minSize : new paper.Size(radius);
				};

				planet.calculatePosition = function() {
					var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
					var pos = planet.star.calculatePosition()
						.add(this.star.calculateSize().width/2)
						.add(this.calculateSize().width)
						.add((scales.AU * semimajor_axis) * scale);
					pos.y = 0;
					return pos;
				};

				planet.calculateOrbitalPath = function() {
					var pos = this.calculatePosition();
					return new paper.Size(pos.x*2);
				};

				planet.orbit = paper.Path.Ellipse({
					center: star.item.getPosition(),
					radius: planet.calculateOrbitalPath(),
					strokeColor: base02,
					strokeWidth: 1
				});
				planet.item = paper.Path.Ellipse({
					center: planet.orbit.getFirstSegment().getPoint(),
					radius: planet.star.calculateSize().add(planet.calculateSize())
				});

				planet.orbit.planet = planet;
				planet.orbit.onFrame = function() {
					if (galaxyLayer.getChildren().length == 1) {
						if (drawSystem) {
							this.setPosition(this.planet.star.calculatePosition());
							this.planet.item.setPosition(this.getFirstSegment().getPoint());
							this.rotate(this.planet.rotation, this.planet.star.calculatePosition());
						}
					}
				};
				planet.orbit.remove();
				var planetColor = planet.color;

				if (planetColor == "rainbow") {
					planetColor = {
						gradient: {
							stops: [
								yellow, orange, red, magenta,
								violet, blue, cyan, green
							],
							radial: true
						},
						origin: planet.item.position,
						destination: planet.item.bounds.rightCenter
					};
				}

				planet.item.fillColor = planetColor;
				planet.item.planet = planet;
				planet.item.remove();
				star.planets[index] = planet;
			});

			// Add the Star as a reference to item
			star.item.star = star;
			stars[starID] = star;
		});

		populateSelects();
		document.getElementById("filter_star_total").innerHTML = starTotal;
		document.getElementById("filter_planet_total").innerHTML = planetTotal;
		document.getElementById("start").disabled = false;
		document.getElementById("start").innerHTML = "Start";
		// Hardcode an initial focus while working out the zoom movement issue
		var gpStar = getParameterByName("star");
		var gpPlanet = getParameterByName("planet");

		if (gpStar) {
			setCurrentStar(stars[gpStar]);
			var pos = currentStar.calculatePosition();
			var size = currentStar.calculateSize();
			optionValue = currentStar.name + "|" + currentStar.star_id + "|" + pos.x + "|" + pos.y + "|" + size.width.toFixed(2) + "|" + currentStar.color.join("_");
			starSystemID.value = parseInt(gpStar);
			filterStarStar.value = optionValue;
		} else if (gpPlanet) {
			Object.keys(stars).forEach(function(starID) {
				stars[starID].planets.forEach(function(planet) {
					if (planet.planet_id == gpPlanet) {
						setCurrentStar(stars[starID]);
						currentPlanet = planet;
						document.getElementById("planetary_position").value = parseInt(planet.planetary_position);
						var pos = currentStar.calculatePosition();
						var size = currentStar.calculateSize();
						optionValue = currentStar.name + "|" + currentStar.star_id + "|" + pos.x + "|" + pos.y + "|" + size.width.toFixed(2) + "|" + currentStar.color.join("_");
						starSystemID.value = parseInt(starID);
						filterStarStar.value = optionValue;
					}
				});
			});
		} else {
			// If no star or planet is requested let's pick a star at random
			var starID = getRandomInclusive(1, 2500, true);
			setCurrentStar(stars[starID]);
			starSystemID.value = starID;
		}
	}
});

req.send(null);