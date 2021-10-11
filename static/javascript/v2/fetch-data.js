// Load the Star Data
var starsRequest = new XMLHttpRequest();
starsRequest.overrideMimeType("application/json");
starsRequest.open('GET', '/stars', true);

// Process the Star data on successful load
starsRequest.addEventListener("load", function () {
	if (starsRequest.readyState == 4 && starsRequest.status == "200") {
		stars = JSON.parse(starsRequest.responseText);
		var filterStarStar = document.getElementById("filter_star_star");
		var starSystemID = document.getElementById("star_system_id");

		// Setup Symbols for the habitable zones
		var ringStart = new paper.Path.Ellipse({
			center: new paper.Point(0,0),
			size: new paper.Size(10,10),
			fillColor: green
		});
		var ringEnd = new paper.Path.Ellipse({
			center: new paper.Point(0,0),
			size: new paper.Size(20,20),
			fillColor: green
		});
		symbols.ring_start = new paper.Symbol(ringStart);
		symbols.ring_end = new paper.Symbol(ringEnd);

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
						if (!this.habitableZone || this.calculateHabitableZoneRadius()[1] !== this.habitableZone.getBounds().getSize().width) {
							if (this.habitableZone) {
								this.habitableZone.remove();
							}

							symbols.ring_start.definition.getBounds().setSize(new paper.Size(this.calculateHabitableZoneRadius()[0]));
							symbols.ring_start.definition.setPosition(point);
							symbols.ring_end.definition.getBounds().setSize(new paper.Size(this.calculateHabitableZoneRadius()[1]));
							symbols.ring_end.definition.setPosition(point);
							this.habitableZone = symbols.ring_end.definition.exclude(symbols.ring_start.definition);
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
			star.item = new paper.Path.Ellipse({
				center: new paper.Point(0,0),
				radius: minSize
			});

			// This is calculating the stars color depending on whether there is more than 1
			if (star.color.length > 1) {
				star.item.fillColor = {
					gradient: {
						stops: star.color,
						radial: true
					},
					origin: star.item.getPosition(),
					destination: star.item.getBounds().rightCenter
				};
			} else {
				star.item.fillColor = star.color;
			}

			// Calculate Habitable Zone radius
			star.calculateHabitableZoneRadius = function() {
				var zoneStart = parseFloat(this.habitable_zone.split(" - ")[0]);
				var zoneEnd = parseFloat(this.habitable_zone.split(" - ")[1]);
				var zoneStartSize = ((scales.AU * zoneStart) * scale) + this.calculateSize().width;
				var zoneEndSize = ((scales.AU * zoneEnd) * scale) + this.calculateSize().width;
				return [zoneStartSize, zoneEndSize]
			};

			// For now if you click on the star it will log the ID to the console
			// Want to do more here with selection/info/planet display
			star.item.onMouseUp = function() {
				setCurrentStar(this.star);
			};

			// Do more here but also need to increase the hitbox size to allow easier clicking
			star.item.onMouseEnter = function() {
				galaxy.className = "pointer";
			};

			star.item.onMouseLeave = function() {
				galaxy.className = "";
			};

			// onFrame is called 60 times a second (where possible)
			star.item.frameUpdate = function() {
				// If the Star is no longer in the bounds of the canvas view let's remove it
				if (!this.isInside(paper.view.bounds) && !drawSystem) {
					this.remove();
				}

				if (this.star.selected) {
					var color = this.star.owned
						? green
						: this.star.owned_planet
							? cyan
							: this.star.selected
								? blue
								: violet;
					this.setStrokeColor(color);
					this.setStrokeWidth(2);
					this.bringToFront();
				} else {
					this.setStrokeWidth(0);
				}
			};

			// Loop over each Planet and set them up for later use
			// Might be a better way of doing this
			star.planets.forEach(function(planet, index) {
				var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
				planet.star = star;
				planet.rotation = 1 / Math.sqrt(semimajor_axis);

				planet.calculateSize = function() {
					var radius = planetSizes[this.size] * scale;
					return minSize.width > radius ? minSize : new paper.Size(radius);
				};

				planet.calculatePosition = function() {
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

							if (this.planet.owned || (currentPlanet && currentPlanet.planet_id === this.planet.planet_id)) {
								this.planet.item.setStrokeColor(this.planet.owned ? green : violet);
								this.planet.item.setStrokeWidth(2);
							} else {
								this.planet.item.setStrokeWidth(0);
							}
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
		var gpScale = getParameterByName("scale");

		if (!isNaN(parseFloat(gpScale))) {
			scale = parseFloat(gpScale);
			scaleText.content = "Current Scale Kilometers 1:" + scale;
		}

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
						setCurrentPlanet(parseInt(planet.planetary_position));
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

function getStakeDexo(cardanoAddress) {
	if (cardanoAddress == "") {
		cardanoAddress = "stake1uydj7egwaj020lstvxctmm67ssyfkxpdcg8tqpsm9f5heug8n0gdz";
	}

	var button = document.getElementById("fetch-dexo")
	button.disabled = true;
	button.innerHTML = "- Loading -";
	reset();

	var req = new XMLHttpRequest();
	req.overrideMimeType("application/json");
	req.open('GET', '/stake/' + cardanoAddress, true);

	req.onreadystatechange = function () {
		var starSelect = document.getElementById("filter_star_star");
		starSelect.value = "--";
		button.innerHTML = "Fetch";
		button.disabled = false;
		resetFilters();

		if (req.readyState == 4 && req.status == "200") {
			var stakeStars = JSON.parse(req.responseText);

			stakeStars.forEach(function(star) {
				var ownedCount = 0;
				stars[star.star_id].selected = true;

				star.planets.forEach(function(planet, index) {
					ownedCount = planet.owned
						? ownedCount + 1
						: ownedCount;
					stars[star.star_id].planets[index].owned = planet.owned;
					stars[star.star_id].owned = stars[star.star_id].n_planets === ownedCount
						? true
						: false;
					stars[star.star_id].owned_planet = planet.owned
						? true
						: stars[star.star_id].owned_planet;
				});

				starSelect.childNodes.forEach(function(option){
					if (option.value.includes("|"+star.star_id+"|")) {
						option.selected = true;
					}
				});
			});
		}
	};

	req.send(null);
}