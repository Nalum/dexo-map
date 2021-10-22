var filters = {
	"filter_star_spectral_type": {},
	"filter_star_color": {},
	"filter_star_effective_temperature": {},
	"filter_star_region": {},
	"filter_star_quadrant": {},
	"filter_star_sector": {},
	"filter_star_radius": {},
	"filter_star_luminosity": {},
	"filter_star_mass": {},
	"filter_star_n_planets": {},
	"filter_planet_bg_star_color": {},
	"filter_planet_color": {},
	"filter_planet_composition": {},
	"filter_planet_large_satellites": {},
	"filter_planet_life": {},
	"filter_planet_planetary_position": {},
	"filter_planet_research_impact": {},
	"filter_planet_rings": {},
	"filter_planet_rings_color": {},
	"filter_planet_satellites": {},
	"filter_planet_size": {}
};

function startHowTo() {
	document.getElementById("how_to").className = document.getElementById("how_to").className == "" ? "hidden" : "";
	document.getElementById("filter").className = document.getElementById("filter").className == "" ? "hidden" : "";
}

function showHideFilters(clicked) {
	var filterFetchContainer = document.getElementById("filter_fetch_container");
	var filterStarContainer = document.getElementById("filter_star_container");
	var filterPlanetContainer = document.getElementById("filter_planet_container");
	var filterFetchHeader = document.getElementById("filter_fetch_header");
	var filterStarHeader = document.getElementById("filter_star_header");
	var filterPlanetHeader = document.getElementById("filter_planet_header");

	switch (clicked.dataset.target) {
		case "filter_fetch":
			showHideFilterSection(
				filterFetchContainer, filterFetchHeader,
				filterStarContainer, filterStarHeader,
				filterPlanetContainer, filterPlanetHeader
			);
			break;
		case "filter_star":
			showHideFilterSection(
				filterStarContainer, filterStarHeader,
				filterFetchContainer, filterFetchHeader,
				filterPlanetContainer, filterPlanetHeader
			);
			break;
		case "filter_planet":
			showHideFilterSection(
				filterPlanetContainer, filterPlanetHeader,
				filterStarContainer, filterStarHeader,
				filterFetchContainer, filterFetchHeader
			);
			break;
	}
}

function showHideFilterSection(clickedContainer, clickedHeader, otherContainer1, otherHeader1, otherContainer2, otherHeader2) {
	clickedContainer.className = "";
	otherContainer1.className = "hidden";
	otherContainer2.className = "hidden";

	clickedHeader.childNodes.forEach(function(node) {
		if (node.tagName === "SPAN") {
				node.innerHTML = "&laquo;";
		}
	});

	otherHeader1.childNodes.forEach(function(node) {
		if (node.tagName === "SPAN") {
				node.innerHTML = "&raquo;";
		}
	});

	otherHeader2.childNodes.forEach(function(node) {
		if (node.tagName === "SPAN") {
				node.innerHTML = "&raquo;";
		}
	});
}

function resetStarFilters() {
	Object.keys(filters).forEach(function(key) {
		if (key.indexOf("_star_") === 6) {
			document.getElementById(key).value = "--";
		}
	});
}

function resetPlanetFilters() {
	Object.keys(filters).forEach(function(key) {
		if (key.indexOf("_planet_") === 6) {
			document.getElementById(key).value = "--";
		}
	});
}

function resetFilters() {
	document.getElementById('filter_fetch_cardano_address').value = "";
	document.getElementById('filter_star_star').value = "--";
	document.getElementById("filter_star_limit_owned_in_system").checked = false;
	document.getElementById("filter_star_limit_owned_system").checked = false;
	document.getElementById('filter_planet_limit_owned').checked = false;
	resetPlanetFilters();
	resetStarFilters();
}

function deselectStars() {
	Object.keys(stars).forEach(function(starID) {
		stars[starID].selected = false;
	});
}

function reset() {
	galacticCenter = new paper.Point(0,0);
	scale = minZoom;
	resetFilters();
	deselectStars();
}

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

function populateSelects() {
	var select = document.getElementById("filter_star_star");

	Object.keys(stars).forEach(function (starID, i) {
		var pos = stars[starID].calculatePosition();
		var size = stars[starID].calculateSize();
		var option = document.createElement("option");
		option.value = stars[starID].name + "|" + stars[starID].star_id + "|" + pos.x + "|" + pos.y + "|" + size.width.toFixed(2) + "|" + stars[starID].color.join("_");
		option.innerHTML = stars[starID].name + " #" + stars[starID].star_id;
		select.appendChild(option);

		filters["filter_star_spectral_type"][stars[starID].spectral_type] = true;
		filters["filter_star_color"][stars[starID].color.join("_")] = true;
		filters["filter_star_effective_temperature"][stars[starID].effective_temperature] = true;
		filters["filter_star_region"][stars[starID].region] = true;
		filters["filter_star_quadrant"][stars[starID].quadrant] = true;
		filters["filter_star_sector"][stars[starID].sector] = true;
		filters["filter_star_radius"][stars[starID].radius] = true;
		filters["filter_star_luminosity"][stars[starID].luminosity] = true;
		filters["filter_star_mass"][stars[starID].mass] = true;
		filters["filter_star_n_planets"][stars[starID].n_planets] = true;

		stars[starID].planets.forEach(function(planet) {
			filters["filter_planet_bg_star_color"][planet.bg_star_color] = true;
			filters["filter_planet_color"][planet.color] = true;
			filters["filter_planet_composition"][planet.composition] = true;
			filters["filter_planet_large_satellites"][planet.large_satellites] = true;
			filters["filter_planet_life"][planet.life == "" ? "none" : planet.life] = true;
			filters["filter_planet_planetary_position"][planet.planetary_position[0] + (planet.planetary_position[1] != " " ? planet.planetary_position[1] : "")] = true;
			filters["filter_planet_research_impact"][planet.research_impact] = true;
			filters["filter_planet_rings"][planet.rings == "" ? "none" : planet.rings] = true;
			filters["filter_planet_rings_color"][planet.rings_color == "" ? "none" : planet.rings_color] = true;
			filters["filter_planet_satellites"][planet.satellites] = true;
			filters["filter_planet_size"][planet.size] = true;
		});
	});

	Object.keys(filters).forEach(function(key) {
		var select = document.getElementById(key);

		Object.keys(filters[key]).forEach(function(v) {
			var option = document.createElement("option");
			option.value = v;
			option.innerHTML = v;
			select.appendChild(option);
		});

		var options = [];
		var numbers = false;

		select.childNodes.forEach(function (option, key) {
			if (key > 0) {
				if (!isNaN(parseFloat(option.value))) {
					options.push(parseFloat(option.value));
					numbers = true;
				} else {
					options.push(option.value);
					numbers = false;
				}
			}
		});

		if (numbers) {
			options.sort(function(a,b) {
				return a - b;
			});
		} else {
			options.sort();
		}

		select.childNodes.forEach(function (option, key) {
			if (key > 0) {
				option.value = options[key-1];
				option.innerHTML = options[key-1];
			}
		});
	});
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

// Calculate the Percentage of Stars Selected against the Total
function starPercentCalc() {
	var count = document.getElementById("filter_star_count");
	var percent = document.getElementById("filter_star_percent");
	count.innerHTML = document.getElementById("filter_star_star").selectedOptions.length;
	percent.innerHTML = ((document.getElementById("filter_star_star").selectedOptions.length / starTotal) * 100).toFixed(4);
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
	document.getElementById("star_habitable_zone").innerHTML = currentStar.habitable_zone;
	document.getElementById("star_longitude").innerHTML = currentStar.longitude;
	document.getElementById("star_radial_distance").innerHTML = currentStar.radial_distance;
	document.getElementById("star_radius").innerHTML = currentStar.radius;
	var colorHTML = "";
	currentStar.color.forEach(function(color) {
		colorHTML = colorHTML + "<span><span style='background-color: "
		+ color + "; border: 1px solid " + base2 + "; height: 10px; width: 10px;'></span>" + color + "</span>";
	});
	document.getElementById("star_color").innerHTML = colorHTML;
}

function setPlanetInfo() {
	document.getElementById("planet_name").innerHTML = currentStar.name + "-" + 
		positionLetter[parseInt(currentPlanet.planetary_position.split(" ")[0])-1];
	document.getElementById("planet_id").innerHTML = " #" + currentPlanet.planet_id;
	document.getElementById("planet_image").src = currentPlanet.image_url;
	document.getElementById("planet_background_star_color").innerHTML = "<span style='background-color: "
	+ currentPlanet.bg_star_color + "; border: 1px solid " + base2 + "; height: 10px; width: 10px;'></span>" + currentPlanet.bg_star_color;
	document.getElementById("planet_color").innerHTML = "<span style='background-color: "
		+ currentPlanet.color + "; border: 1px solid " + base2 + "; height: 10px; width: 10px;'></span>" + currentPlanet.color;
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

function updateStarSelect() {
	var starFilterString = generateStarFilterString();
	var planetFilterString = generatePlanetFilterString();
	var matchingStars = [];
	var starSelect = document.getElementById("filter_star_star");
	var planetCount = 0;
	var limitOwnedInSystem = document.getElementById("filter_star_limit_owned_in_system").checked;
	var limitOwnedSystem = document.getElementById("filter_star_limit_owned_system").checked;
	var limitOwnedPlanets = document.getElementById("filter_planet_limit_owned").checked;
	starSelect.value = "--";
	deselectStars();

	if (starFilterString !== "") {
		resetPlanetFilters();

		Object.keys(stars).forEach(function(starID) {
			stars[starID].selected = false;
			var innerStarFilterString = generateStarFilterString(stars[starID]);
			ownedInSystem = false;
			ownedSystem = false;
			ownedPlanetCount = 0;

			stars[starID].planets.forEach(function(planet) {
				if (planet.owned) {
					ownedPlanetCount++;
					ownedInSystem = true;
				}
			});

			if (ownedPlanetCount === stars[starID].n_planets) {
				ownedSystem = true;
			}

			if (innerStarFilterString === starFilterString) {
				if (limitOwnedInSystem) {
					if (ownedInSystem) {
						if (matchingStars.indexOf(starID) == -1) {
							matchingStars.push(starID);
						}
					}
				} else if (limitOwnedSystem) {
					if (ownedSystem) {
						if (matchingStars.indexOf(starID) == -1) {
							matchingStars.push(starID);
						}
					}
				} else {
					if (matchingStars.indexOf(starID) == -1) {
						matchingStars.push(starID);
					}
				}
			}
		});
	}

	if (planetFilterString !== "") {
		resetStarFilters();

		Object.keys(stars).forEach(function(starID) {
			stars[starID].selected = false;
			stars[starID].planets.forEach(function(planet) {
				var innerPlanetFilterString = generatePlanetFilterString(planet);

				if (innerPlanetFilterString === planetFilterString) {
					if (limitOwnedPlanets) {
						if (planet.owned) {
							if (matchingStars.indexOf(planet.star.star_id) == -1) {
								matchingStars.push(planet.star.star_id);
							}

							planetCount++;
						}
					} else {
						if (matchingStars.indexOf(planet.star.star_id) == -1) {
							matchingStars.push(planet.star.star_id);
						}

						planetCount++;
					}
				}
			});
		});
	}

	matchingStars.forEach(function(starID) {
		stars[starID].selected = true;
		starSelect.childNodes.forEach(function(option) {
			if (option.value.includes("|"+starID+"|")) {
				option.selected = true;
			}
		});
	});

	starPercentCalc();
	document.getElementById("filter_planet_count").innerHTML = planetCount;
	document.getElementById("filter_planet_percent").innerHTML = ((planetCount/planetTotal)*100).toFixed(4);
}

function generateStarFilterString(star) {
	var filterString = "";
	var spectral_type = typeof star !== "undefined" ? star.spectral_type : document.getElementById("filter_star_spectral_type").value;
	var color = typeof star !== "undefined" ? star.color.join("_") : document.getElementById("filter_star_color").value;
	var effective_temperature = typeof star !== "undefined" ? star.effective_temperature : document.getElementById("filter_star_effective_temperature").value;
	var region = typeof star !== "undefined" ? star.region : document.getElementById("filter_star_region").value;
	var quadrant = typeof star !== "undefined" ? star.quadrant : document.getElementById("filter_star_quadrant").value;
	var sector = typeof star !== "undefined" ? star.sector : document.getElementById("filter_star_sector").value;
	var radius = typeof star !== "undefined" ? star.radius : document.getElementById("filter_star_radius").value;
	var luminosity = typeof star !== "undefined" ? star.luminosity : document.getElementById("filter_star_luminosity").value;
	var mass = typeof star !== "undefined" ? star.mass : document.getElementById("filter_star_mass").value;
	var n_planets = typeof star !== "undefined" ? star.n_planets : document.getElementById("filter_star_n_planets").value;

	if (document.getElementById("filter_star_spectral_type").value != "--") {
		filterString += spectral_type;
	}

	if (document.getElementById("filter_star_color").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += color;
	}

	if (document.getElementById("filter_star_effective_temperature").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += effective_temperature;
	}

	if (document.getElementById("filter_star_region").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += region;
	}

	if (document.getElementById("filter_star_quadrant").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += quadrant;
	}

	if (document.getElementById("filter_star_sector").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += sector;
	}

	if (document.getElementById("filter_star_radius").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += radius;
	}

	if (document.getElementById("filter_star_luminosity").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += luminosity;
	}

	if (document.getElementById("filter_star_mass").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += mass;
	}

	if (document.getElementById("filter_star_n_planets").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += n_planets;
	}

	return filterString;
}

function generatePlanetFilterString(planet) {
	var filterString = "";
	var bg_star_color = typeof planet !== "undefined" ? planet.bg_star_color : document.getElementById("filter_planet_bg_star_color").value;
	var color = typeof planet !== "undefined" ? planet.color : document.getElementById("filter_planet_color").value;
	var composition = typeof planet !== "undefined" ? planet.composition : document.getElementById("filter_planet_composition").value;
	var large_satellites = typeof planet !== "undefined" ? planet.large_satellites : document.getElementById("filter_planet_large_satellites").value;
	var life = typeof planet !== "undefined" ? (planet.life === "" ? "none" : planet.life) : document.getElementById("filter_planet_life").value;
	var planetary_position = typeof planet !== "undefined" ? planet.planetary_position.split(" ")[0] : document.getElementById("filter_planet_planetary_position").value;
	var research_impact = typeof planet !== "undefined" ? planet.research_impact : document.getElementById("filter_planet_research_impact").value;
	var rings = typeof planet !== "undefined" ? (planet.rings === "" ? "none" : planet.rings) : document.getElementById("filter_planet_rings").value;
	var rings_color = typeof planet !== "undefined" ? (planet.rings_color === "" ? "none": planet.rings_color) : document.getElementById("filter_planet_rings_color").value;
	var satellites = typeof planet !== "undefined" ? planet.satellites : document.getElementById("filter_planet_satellites").value;
	var size = typeof planet !== "undefined" ? planet.size : document.getElementById("filter_planet_size").value;

	if (document.getElementById("filter_planet_bg_star_color").value != "--") {
		filterString += bg_star_color;
	}

	if (document.getElementById("filter_planet_color").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += color;
	}

	if (document.getElementById("filter_planet_composition").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += composition;
	}

	if (document.getElementById("filter_planet_large_satellites").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += large_satellites;
	}

	if (document.getElementById("filter_planet_life").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += life;
	}

	if (document.getElementById("filter_planet_planetary_position").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += planetary_position;
	}

	if (document.getElementById("filter_planet_research_impact").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += research_impact;
	}

	if (document.getElementById("filter_planet_rings").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += rings;
	}

	if (document.getElementById("filter_planet_rings_color").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += rings_color;
	}

	if (document.getElementById("filter_planet_satellites").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += satellites;
	}

	if (document.getElementById("filter_planet_size").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += size;
	}

	return filterString;
}