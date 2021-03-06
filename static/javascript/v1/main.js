function showHide() {
	document.getElementById("how_to").className = document.getElementById("how_to").className == "" ? "hidden" : "";
	document.getElementById("form").className = document.getElementById("form").className == "" ? "hidden" : "";
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
	document.getElementById('filter_star_sizes').checked = false;
	document.getElementById('filter_star_alpha').checked = false;
	document.getElementById('filter_star_regions').checked = false;
	document.getElementById('filter_star_star').value = "--";
	document.getElementById('filter_planet_limit_owned').checked = false;
	resetFilters();
	galaxyCtx.draw();
	starCtx.draw();
}

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
const galaxyCanvas = document.getElementById("galaxy");
const galaxyCtx = galaxyCanvas.getContext("2d");
const starCanvas = document.getElementById("star_system");
const starCtx = starCanvas.getContext("2d");
const scaleFactor = 1.1;
const systemView = {
	REarth: 6378.00,
	RSol: 696000.00,
	AU: 149597900.00
};
const galaxyView = {
	RSol: 100.00
};
const XS = 0.5;
const S = 1.0;
const M = 3.0;
const L = 6.0;
const XL = 10.0;

const planetSizes = {
	"XS": systemView.REarth*XS,
	"S": systemView.REarth*S,
	"M": systemView.REarth*M,
	"L": systemView.REarth*L,
	"XL": systemView.REarth*XL,
};

var starSystem = null;
var scale = 50;
var translation = 0;
var stars = null;
var lastX = 0, lastY = 0;
var dragStart, dragged;
var maxLums = 0.0, minLums = 0.1;
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
var planetTotal = 0;
var starTotal = 0;

galaxyCtx.translate(galaxyCanvas.width / 2, galaxyCanvas.height / 2);
galaxyCtx.draw = function () {
	this.clearRect(-this.canvas.width * 100000000000000, -this.canvas.width * 100000000000000, this.canvas.width * 200000000000000, this.canvas.width * 200000000000000);

	if (window.stars !== null) {
		paintTheStars(this);
		paintFocused(this, generatePlanetFilterString());
	}
}

starCtx.translate(starCanvas.width / 2, starCanvas.height / 2);
starCtx.draw = function () {
	var ctx = this;
	ctx.clearRect(-ctx.canvas.width * 100000000000000, -ctx.canvas.width * 100000000000000, ctx.canvas.width * 200000000000000, ctx.canvas.width * 200000000000000);

	if (window.stars !== null) {
		if (window.starSystem !== null) {
			var starSize = systemView.RSol*window.starSystem.radius;
			var zoneStart = parseFloat(window.starSystem.habitable_zone.split(" - ")[0]);
			var zoneEnd = parseFloat(window.starSystem.habitable_zone.split(" - ")[1]);
			var zoneStartSize = ((systemView.AU * zoneStart) * Math.LOG10E) + starSize;
			var zoneEndSize = ((systemView.AU * zoneEnd) * Math.LOG10E) + starSize;

			if (zoneStart < zoneEnd) {
				ctx.beginPath();
				ctx.ellipse(0, 0, zoneEndSize, zoneEndSize, 0, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(133, 153, 0, 0.1)";
				ctx.fill();

				ctx.beginPath();
				ctx.font = "bold 15px Ariel";
				ctx.fillStyle = violet;
				ctx.fillText("Habitable Zone", zoneStartSize + 6, -40);

				ctx.beginPath();
				ctx.ellipse(0, 0, zoneStartSize, zoneStartSize, 0, 0, Math.PI * 2);
				ctx.fillStyle = "#00121D";
				ctx.fill();
			}

			ctx.beginPath();
			ctx.ellipse(0, 0, starSize, starSize, 0, 0, Math.PI*2);
			ctx.fillStyle = starColor(window.starSystem.color.join("_"), 1);
			ctx.fill();

			setStarSystemInfo();
			setPlanetInfo(window.starSystem.planets[systemItem]);

			window.starSystem.planets.forEach(function(planet, i) {
				var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
				var radius = planetSizes[planet.size];
				var x = ((systemView.AU * semimajor_axis) * Math.LOG10E) + starSize + radius;
				drawOrbit(ctx, x, radius/2, planet.color);
				drawPlanet(ctx, x, 0, radius, planet, typeof planet.selected === "undefined" && i===systemItem ? true : planet.selected);
			});

			for (i=-100;i<=100;i++) {
				var x = (systemView.AU*i)/10;
				if (x !== 0) {
					ctx.beginPath();
					ctx.moveTo(x, 1000000);
					ctx.lineWidth = 200000;
					ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
					ctx.lineTo(x, -1000000);
					ctx.stroke();
				}
			}
		}
	}
}

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', '/stars', true);
req.onreadystatechange = function () {
	if (req.readyState == 4 && req.status == "200") {
		window.stars = JSON.parse(req.responseText);
		window.starSystem = window.stars[document.getElementById("star_system_id").value];

		Object.keys(window.stars).forEach(function (starKey) {
			if (window.stars[starKey].luminosity > maxLums) {
				maxLums = window.stars[starKey].luminosity;
			}

			planetTotal += window.stars[starKey].planets.length;
			starTotal += 1;
		});

		document.getElementById("filter_star_total").innerHTML = starTotal;
		document.getElementById("filter_planet_total").innerHTML = planetTotal;
		populateSelects();
		galaxyCtx.draw();
		starCtx.scale(0.0001,0.0001);
		starCtx.translate(0,0);
		starCtx.draw();
		document.getElementById("start").disabled = false;
		document.getElementById("start").innerHTML = "Start";

		var galaxyAnim = setInterval(function () {
			var galaxyScale = 0.987;
			galaxyCtx.scale(galaxyScale, galaxyScale);
			galaxyCtx.draw();
		}, 16);
		
		setTimeout(function () {
			clearInterval(galaxyAnim);
		}, 5300);
	}
};
req.send(null);

function getStakeDexo(cardanoAddress) {
	if (cardanoAddress == "") {
		cardanoAddress = "stake1uydj7egwaj020lstvxctmm67ssyfkxpdcg8tqpsm9f5heug8n0gdz";
	}

	var button = document.getElementById("fetch-dexo")
	button.disabled = true;
	button.innerHTML = "- Loading -";

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
				window.stars[star.star_id].planets = star.planets;

				starSelect.childNodes.forEach(function(option){
					if (option.value.includes("|"+star.star_id+"|")) {
						option.selected = true;
					}
				});
			});

			galaxyCtx.draw();
			starCtx.draw();
		}
	};

	req.send(null);
}

function starPercentCalc() {
	var count = document.getElementById("filter_star_count");
	var percent = document.getElementById("filter_star_percent");
	
	count.innerHTML = document.getElementById("filter_star_star").selectedOptions.length;
	percent.innerHTML = ((document.getElementById("filter_star_star").selectedOptions.length / starTotal) * 100).toFixed(4);
}

function galaxyCalcPos(radial_distance, longitude) {
	return {
		x: radial_distance * Math.sin(-longitude * (Math.PI / 180)),
		y: -radial_distance * Math.cos(longitude * (Math.PI / 180))
	}
}

function populateSelects() {
	var select = document.getElementById("filter_star_star");

	Object.keys(window.stars).forEach(function (k, i) {
		var pos = galaxyCalcPos(window.stars[k].radial_distance, window.stars[k].longitude);
		var size = galaxyView.RSol;

		if (document.getElementById("filter_star_sizes").checked) {
			size = galaxyView.RSol * window.stars[k].radius;
		}

		var option = document.createElement("option");
		option.value = window.stars[k].name + "|" + window.stars[k].star_id + "|" + pos.x + "|" + pos.y + "|" + size.toFixed(2) + "|" + starColor(window.stars[k].color.join("_"), 1);
		option.innerHTML = window.stars[k].name + " #" + window.stars[k].star_id;
		select.appendChild(option);

		filters["filter_star_spectral_type"][window.stars[k].spectral_type] = true;
		filters["filter_star_color"][window.stars[k].color.join("_")] = true;
		filters["filter_star_effective_temperature"][window.stars[k].effective_temperature] = true;
		filters["filter_star_region"][window.stars[k].region] = true;
		filters["filter_star_quadrant"][window.stars[k].quadrant] = true;
		filters["filter_star_sector"][window.stars[k].sector] = true;
		filters["filter_star_radius"][window.stars[k].radius] = true;
		filters["filter_star_luminosity"][window.stars[k].luminosity] = true;
		filters["filter_star_mass"][window.stars[k].mass] = true;
		filters["filter_star_n_planets"][window.stars[k].n_planets] = true;

		window.stars[k].planets.forEach(function(planet) {
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

function paintTheStars(ctx) {
	Object.keys(window.stars).forEach(function (k, i) {
		var pos = galaxyCalcPos(window.stars[k].radial_distance, window.stars[k].longitude);
		var size = galaxyView.RSol;
		var alpha = 1;

		if (document.getElementById("filter_star_sizes").checked) {
			size = galaxyView.RSol * window.stars[k].radius;
		}

		if (document.getElementById("filter_star_alpha").checked) {
			alpha = window.stars[k].luminosity / maxLums;

			if (alpha < minLums) {
				alpha = minLums;
			}
		}

		ctx.beginPath();
		ctx.fillStyle = starColor(window.stars[k].color.join("_"), alpha);
		ctx.ellipse(pos.x, pos.y, size, size, 0, 0, Math.PI * 2.0);
		ctx.fill();

		if (document.getElementById("filter_star_regions").checked) {
			ctx.beginPath();
			ctx.ellipse(pos.x, pos.y, size + 5, size + 5, 0, 0, Math.PI * 2.0);
			ctx.strokeStyle = regionColor(window.stars[k].region);
			ctx.lineWidth = 100;
			ctx.stroke();
		}
	});
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

	if (starFilterString !== "") {
		resetPlanetFilters();

		Object.keys(window.stars).forEach(function(starID) {
			var innerStarFilterString = generateStarFilterString(window.stars[starID]);
			ownedInSystem = false;
			ownedSystem = false;
			ownedPlanetCount = 0;

			window.stars[starID].planets.forEach(function(planet) {
				if (planet.owned) {
					ownedPlanetCount++;
					ownedInSystem = true;
				}
			});

			if (ownedPlanetCount === window.stars[starID].n_planets) {
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

		Object.keys(window.stars).forEach(function(starID) {
			window.stars[starID].planets.forEach(function(planet) {
				var innerPlanetFilterString = generatePlanetFilterString(planet);

				if (innerPlanetFilterString === planetFilterString) {
					if (limitOwnedPlanets) {
						if (planet.owned) {
							if (matchingStars.indexOf(planet.host_star.star_id) == -1) {
								matchingStars.push(planet.host_star.star_id);
							}

							planetCount++;
						}
					} else {
						if (matchingStars.indexOf(planet.host_star.star_id) == -1) {
							matchingStars.push(planet.host_star.star_id);
						}

						planetCount++;
					}
				}
			});
		});
	}

	matchingStars.forEach(function(starID) {
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

function paintFocused(ctx, filter) {
	var selected = document.getElementById("filter_star_star").selectedOptions;
	var showNames = document.getElementById("filter_star_labels").checked;

	for (i = 0; i < selected.length; i++) {
		if (selected[i].value != "0") {
			var data = selected[i].value.split("|");
			var x = data[2] * 1, y = data[3] * 1, size = data[4] * 1, color = data[5];
			ctx.beginPath();
			ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2.0);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.strokeStyle = violet;
			ctx.lineWidth = 40;
			ctx.stroke();

			if (showNames) {
				nameStar(ctx, x, y, data[0] + " #" + data[1], window.stars[data[1]].planets, filter);
			} else {
				ctx.beginPath();
				ctx.ellipse(x, y, size+50, size+50, 0, 0, Math.PI * 2.0);
				ctx.strokeStyle = base3;
				ctx.lineWidth = 40;
				ctx.stroke();
			}
		}
	}
}

function nameStar(ctx, x, y, name, planets, filter) {
	var textSize = ctx.measureText(name);
	var ownedCount = 0;
	var strokeColor = red;

	planets.forEach(function(planet, i) {
		if (planet.owned) {
			ownedCount++;
		}
	});

	if (ownedCount > 0) {
		strokeColor = orange;
	}

	if (ownedCount === planets.length) {
		strokeColor = green;
	}

	ctx.beginPath();
	ctx.lineWidth = 50;
	ctx.strokeStyle = violet;
	ctx.moveTo(x+55,y-55);
	ctx.lineTo(x+300,y-300);
	ctx.stroke();

	ctx.beginPath();
	ctx.lineWidth = 75;
	ctx.strokeStyle = strokeColor;
	ctx.moveTo(x+290,y-300);
	ctx.lineTo(x+textSize.width+100,y-300);
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = base02;
	ctx.strokeStyle = violet
	ctx.lineWidth = 25;
	ctx.strokeRect(x+280, y-500, textSize.width+125, 200);
	ctx.fillRect(x+280, y-500, textSize.width+125, 200);

	ctx.beginPath();
	ctx.fillStyle = base0;
	ctx.font = "bold 160px Arial";
	ctx.fillText(name, x+330, y-350);

	ctx.beginPath();
	ctx.fillStyle = base02;
	ctx.strokeStyle = violet;
	ctx.lineWidth = 25;
	ctx.strokeRect(x+280, y-260, (planets.length*70)+30, 100);
	ctx.fillRect(x+280, y-260, (planets.length*70)+30, 100);

	planets.forEach(function(planet, i) {
		var filter_planet_filter = generatePlanetFilterString(planet);
		var px = x + 330 + (70*i);
		var py = y - 205;
		drawPlanet(ctx, px, py, 25, planet);

		if (planet.owned) {
			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI *2.0);
			ctx.strokeStyle = green;
			ctx.lineWidth = 10;
			ctx.stroke();
		}

		if (filter != "") {
			if (filter == filter_planet_filter) {
				ctx.beginPath();
				
				if (planet.owned) {
					ctx.ellipse(px, py, 20, 20, 0, 0, Math.PI *2.0);
				} else {
					ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI *2.0);
				}

				ctx.strokeStyle = base3;
				ctx.lineWidth = 2.5;
				ctx.stroke();
			}
		}
	});
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

function starColor(color, alpha) {
	switch (color) {
		case "#0000FF":
			return "rgba(38, 139, 210, " + alpha + ")";
			break;
		case "#0000FF_#FFFFFF":
			return "rgba(42, 161, 152, " + alpha + ")";
			break;
		case "#FF6347":
			return "rgba(203, 75, 22, " + alpha + ")";
			break;
		case "#FFA500_#FF0000":
			return "rgba(220, 50, 47, " + alpha + ")";
			break;
		case "#FFFF00":
			return "rgba(181, 137, 0, " + alpha + ")";
			break;
		case "#FFFF00_#FFFFFF":
			return "rgba(201, 157, 20, " + alpha + ")";
			break;
		default:
			return "rgba(253, 246, 227, " + alpha + ")";
	}
}

function regionColor(region) {
	switch (region) {
		case "Galactic Bar":
			return "rgba(76,114,176,1)";
			break;
		case "Hypatian Arm":
			return "rgba(85,168,104,1)";
			break;
		case "Jacobian Spur":
			return "rgba(129,114,179,1)";
			break;
		case "Marshan Arm":
			return "rgba(221,132,82,1)";
			break;
		case "Nether Arm":
			return "rgba(196,78,82,1)";
			break;
		case "Outerlands":
			return "rgba(218,139,195,1)";
			break;
		case "Ridean Spur":
			return "rgba(147,120,96,1)";
			break;
	}
}

window.onload = function() {
	trackTransforms(galaxyCtx);
	trackTransforms(starCtx);
	galaxyCtx.draw();
	starCtx.draw();
	canvasEvents(galaxyCanvas, galaxyCtx);
	canvasEvents(starCanvas, starCtx);
}

function canvasEvents(canvas, ctx) {
	canvas.addEventListener(
		"mousedown",
		function (evt) {
			document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = "none";
			lastX = evt.offsetX - (canvas.width / 2) || (evt.pageX - (canvas.width / 2)) - canvas.offsetLeft;

			if (canvas.id === "star_system") {
				lastY = 0;
			} else {
				lastY = evt.offsetY - (canvas.width / 2) || (evt.pageY - (canvas.width / 2)) - canvas.offsetTop;
			}

			dragStart = ctx.transformedPoint(lastX, lastY);
			dragged = false;
			canvas.className = "grabbing";
		},
		false
	);

	canvas.addEventListener(
		"mousemove",
		function (evt) {
			lastX = evt.offsetX - (canvas.width / 2) || (evt.pageX - (canvas.width / 2)) - canvas.offsetLeft;

			if (canvas.id === "star_system") {
				lastY = 0;
			} else {
				lastY = evt.offsetY - (canvas.width / 2) || (evt.pageY - (canvas.width / 2)) - canvas.offsetTop;
			}

			dragged = true;

			if (dragStart) {
				var pt = ctx.transformedPoint(lastX, lastY);
				ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
				ctx.draw();
			}
		},
		false
	);

	canvas.addEventListener(
		"mouseup",
		function (evt) {
			dragStart = null;
			canvas.className = "";
		},
		false
	);

	var zoom = function (clicks) {
		var pt = ctx.transformedPoint(lastX, lastY);
		if (ctx.canvas.id === "star_system") {
			ctx.translate(pt.x, 0);
		} else {
			ctx.translate(pt.x, pt.y);
		}

		factor = Math.pow(scaleFactor, clicks);
		ctx.scale(factor, factor);

		if (ctx.canvas.id === "star_system") {
			ctx.translate(-pt.x, -0);
		} else {
			ctx.translate(-pt.x, -pt.y);
		}

		ctx.draw();
	};

	var handleScroll = function (evt) {
		var delta = evt.wheelDelta
			? evt.wheelDelta / 40
			: evt.detail
				? -evt.detail
				: 0;
		if (delta) zoom(delta);
		return evt.preventDefault() && false;
	};

	canvas.addEventListener("DOMMouseScroll", handleScroll, false);
	canvas.addEventListener("mousewheel", handleScroll, false);
};

// Adds galaxyCtx.getTransform() - returns an SVGMatrix
// Adds galaxyCtx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var xform = svg.createSVGMatrix();
	ctx.getTransform = function () {
		return xform;
	};

	var savedTransforms = [];
	var save = ctx.save;
	ctx.save = function () {
		savedTransforms.push(xform.translate(0, 0));
		return save.call(ctx);
	};

	var restore = ctx.restore;
	ctx.restore = function () {
		xform = savedTransforms.pop();
		return restore.call(ctx);
	};

	var scale = ctx.scale;
	ctx.scale = function (sx, sy) {
		xform = xform.scaleNonUniform(sx, sy);
		return scale.call(ctx, sx, sy);
	};

	var rotate = ctx.rotate;
	ctx.rotate = function (radians) {
		xform = xform.rotate((radians * 180) / Math.PI);
		return rotate.call(ctx, radians);
	};

	var translate = ctx.translate;
	ctx.translate = function (dx, dy) {
		xform = xform.translate(dx, dy);
		return translate.call(ctx, dx, dy);
	};

	var transform = ctx.transform;
	ctx.transform = function (a, b, c, d, e, f) {
		var m2 = svg.createSVGMatrix();
		m2.a = a;
		m2.b = b;
		m2.c = c;
		m2.d = d;
		m2.e = e;
		m2.f = f;
		xform = xform.multiply(m2);
		return transform.call(ctx, a, b, c, d, e, f);
	};

	var setTransform = ctx.setTransform;
	ctx.setTransform = function (a, b, c, d, e, f) {
		xform.a = a;
		xform.b = b;
		xform.c = c;
		xform.d = d;
		xform.e = e;
		xform.f = f;
		return setTransform.call(ctx, a, b, c, d, e, f);
	};

	var pt = svg.createSVGPoint();
	ctx.transformedPoint = function (x, y) {
		pt.x = x;
		pt.y = y;
		return pt.matrixTransform(xform.inverse());
	};
}
