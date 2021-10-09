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
var symbols = {};
// Setup 3 layers for use in the project
// This layer will hold all Stars
var galaxyLayer;
// This layer will hold all Planets
var systemLayer;
// This layer will hold UI elements
var uiLayer;

function setCurrentStar(star) {
	systemLayer.removeChildren();
	currentStar = star;
	currentPlanet = null;
	document.getElementById('planetary_position').value = 0;
	document.getElementById('planetary_position').max = currentStar.planets.length;
	setStarSystemInfo();
}

function setCurrentPlanet(index) {
	if (index > 0) {
		currentPlanet = currentStar.planets[index-1];
		setPlanetInfo();
	} else {
		currentPlanet = null;
	}
}

function systemSetup() {
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

// Setup an initial event to load the paper canvas, mouse zoom event and the star data
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

				systemSetup();

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

	req.send(null);
});