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
	resetPlanetFilters();
	resetStarFilters();
}

function reset() {
	document.getElementById('filter_fetch_cardano_address').value = "";
	document.getElementById('filter_star_alpha').checked = false;
	document.getElementById('filter_star_star').value = "--";
	document.getElementById('filter_planet_limit_owned').checked = false;
	galacticCenter = new paper.Point(0,0);
	scale = minZoom;
	resetFilters();
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
	document.getElementById("star_color").innerHTML = currentStar.color.join(", ");
	document.getElementById("star_habitable_zone").innerHTML = currentStar.habitable_zone;
	document.getElementById("star_longitude").innerHTML = currentStar.longitude;
	document.getElementById("star_radial_distance").innerHTML = currentStar.radial_distance;
	document.getElementById("star_radius").innerHTML = currentStar.radius;
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