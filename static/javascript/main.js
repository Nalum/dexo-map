function showHide() {
	document.getElementById("how-to").className = document.getElementById("how-to").className == "" ? "hidden" : "";
	document.getElementById("form").className = document.getElementById("form").className == "" ? "hidden" : "";
}

function reset() {
	document.getElementById('size').checked = false;
	document.getElementById('alpha').checked = false;
	document.getElementById('regions').checked = false;
	document.getElementById('limit_owned').checked = false;
	document.getElementById('star').value = "0";
	document.getElementById('cardano-address').value = "";

	Object.keys(filters).forEach(function(k) {
		document.getElementById(k).value = "--";
	});

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
const RSol = 100;
const AU = RSol * 100;
var starSystem = null;
var scale = 50;
var translation = 0;
var stars = null;
var lastX = 0, lastY = 0;
var dragStart, dragged;
var maxLums = 0.0, minLums = 0.1;
var filters = {
	"bg_star_color": {},
	"color": {},
	"composition": {},
	"large_satellites": {},
	"life": {},
	"planetary_position": {},
	"research_impact": {},
	"rings": {},
	"rings_color": {},
	"satellites": {},
	"size": {}
};
var planetTotal = 0;

galaxyCtx.translate(galaxyCanvas.width / 2, galaxyCanvas.height / 2);
galaxyCtx.draw = function () {
	this.clearRect(-this.canvas.width * 1000, -this.canvas.width * 1000, this.canvas.width * 2000, this.canvas.width * 2000);

	if (window.stars !== null) {
		paintTheStars(this);
		paintFocused(this, generateFilterString());
	}
}

starCtx.translate(starCanvas.width / 2, starCanvas.height / 2);
starCtx.draw = function () {
	var ctx = this;
	ctx.clearRect(-ctx.canvas.width * 100000000000, -ctx.canvas.width * 100000000000, ctx.canvas.width * 200000000000, ctx.canvas.width * 200000000000);
	var starData = document.getElementById("star_name")

	if (window.stars !== null) {
		if (window.starSystem !== null) {
			var starSize = RSol*window.starSystem.radius;
			var zoneStart = parseFloat(window.starSystem.habitable_zone.split(" - ")[0]);
			var zoneEnd = parseFloat(window.starSystem.habitable_zone.split(" - ")[1]);
			var zoneStartSize = ((AU * zoneStart) * Math.LOG10E) + starSize;
			var zoneEndSize = ((AU * zoneEnd) * Math.LOG10E) + starSize;

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

			displayStarSystemInfo(ctx, starSize);

			window.starSystem.planets.forEach(function(planet, i) {
				var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
				var x = ((AU * semimajor_axis) * Math.LOG10E) + starSize;
				var lineWidth = 50*semimajor_axis

				if (planet.color == "rainbow") {
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 2);
					ctx.strokeStyle = yellow;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 1.75);
					ctx.strokeStyle = orange;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 1.5);
					ctx.strokeStyle = red;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 1.25);
					ctx.strokeStyle = magenta;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 1);
					ctx.strokeStyle = violet;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 0.75);
					ctx.strokeStyle = blue;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 0.5);
					ctx.strokeStyle = cyan;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
		
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI * 0.25);
					ctx.strokeStyle = green;
					ctx.lineWidth = lineWidth;
					ctx.stroke();
				} else {
					ctx.beginPath();
					ctx.ellipse(0, 0, x, x, 0, 0, Math.PI*2);
					ctx.strokeStyle = planet.color;
					ctx.lineWidth = lineWidth;
					ctx.stroke();

					ctx.beginPath();
					ctx.ellipse(x, 0, lineWidth, lineWidth, 0, 0, Math.PI*2);
					ctx.fillStyle = planet.color;
					ctx.fill();
				}

				displayPlanetInfo(ctx, starSize, planet);
			});
		}
	}
}

function planetLetter(position) {
	switch(position.split(" ")[0]) {
		case "1":
			return "a"
		break;
		case "2":
			return "b"
		break;
		case "3":
			return "c"
		break;
		case "4":
			return "d"
		break;
		case "5":
			return "e"
		break;
		case "6":
			return "f"
		break;
		case "7":
			return "g"
		break;
		case "8":
			return "h"
		break;
		case "9":
			return "i"
		break;
		case "10":
			return "j"
		break;
		case "11":
			return "k"
		break;
	}
}

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', '/stars', true);
req.onreadystatechange = function () {
	if (req.readyState == 4 && req.status == "200") {
		window.stars = JSON.parse(req.responseText);
		window.starSystem = window.stars[document.getElementById("star_system_id").value];

		Object.keys(window.stars).forEach(function (k, i) {
			if (window.stars[k].luminosity > maxLums) {
				maxLums = window.stars[k].luminosity;
			}

			planetTotal += window.stars[k].planets.length;
		});

		document.getElementById("planet_total").innerHTML = planetTotal;
		populateSelects();
		galaxyCtx.draw();
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
		var starSelect = document.getElementById("star");
		starSelect.value = "0";
		button.innerHTML = "Fetch";
		button.disabled = false;

		Object.keys(filters).forEach(function(k) {
			document.getElementById(k).value = "--";
		});

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

function populateSelects() {
	var select = document.getElementById("star");

	Object.keys(window.stars).forEach(function (k, i) {
		var x = window.stars[k].radial_distance * Math.sin(-window.stars[k].longitude * (Math.PI / 180));
		var y = -1 * window.stars[k].radial_distance * Math.cos(window.stars[k].longitude * (Math.PI / 180));
		var size = RSol;

		if (document.getElementById("sizes").checked) {
			size = RSol * window.stars[k].radius;
		}

		var option = document.createElement("option");
		option.value = window.stars[k].name + "|" + window.stars[k].star_id + "|" + x + "|" + y + "|" + size + "|" + starColor(window.stars[k].color.join("_"), 1);
		option.innerHTML = window.stars[k].name + " #" + window.stars[k].star_id;
		select.appendChild(option);

		window.stars[k].planets.forEach(function(planet) {
			filters["bg_star_color"][planet.bg_star_color] = true;
			filters["color"][planet.color] = true;
			filters["composition"][planet.composition] = true;
			filters["large_satellites"][planet.large_satellites] = true;
			filters["life"][planet.life == "" ? "none" : planet.life] = true;
			filters["planetary_position"][planet.planetary_position[0] + (planet.planetary_position[1] != " " ? planet.planetary_position[1] : "")] = true;
			filters["research_impact"][planet.research_impact] = true;
			filters["rings"][planet.rings == "" ? "none" : planet.rings] = true;
			filters["rings_color"][planet.rings_color == "" ? "none" : planet.rings_color] = true;
			filters["satellites"][planet.satellites] = true;
			filters["size"][planet.size] = true;
		});
	});

	Object.keys(filters).forEach(function(k) {
		Object.keys(filters[k]).forEach(function(v) {
			var option = document.createElement("option");
			option.value = v;
			option.innerHTML = v;
			document.getElementById(k).appendChild(option);
		});
	});
}

function paintTheStars(ctx) {
	Object.keys(window.stars).forEach(function (k, i) {
		var x = window.stars[k].radial_distance * Math.sin(-window.stars[k].longitude * (Math.PI / 180));
		var y = -1 * window.stars[k].radial_distance * Math.cos(window.stars[k].longitude * (Math.PI / 180));
		var size = RSol;
		var alpha = 1;

		if (document.getElementById("sizes").checked) {
			size = RSol * window.stars[k].radius;
		}

		if (document.getElementById("alpha").checked) {
			alpha = window.stars[k].luminosity / maxLums;

			if (alpha < minLums) {
				alpha = minLums;
			}
		}

		ctx.beginPath();
		ctx.fillStyle = starColor(window.stars[k].color.join("_"), alpha);
		ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2.0);
		ctx.fill();

		if (document.getElementById("regions").checked) {
			ctx.beginPath();
			ctx.ellipse(x, y, size + 5, size + 5, 0, 0, Math.PI * 2.0);
			ctx.strokeStyle = regionColor(window.stars[k].region);
			ctx.lineWidth = 100;
			ctx.stroke();
		}
	});
}

function updateStarSelect() {
	var filterString = generateFilterString();
	var matchingStars = [];
	var starSelect = document.getElementById("star");
	var planetCount = 0;
	var limitOwned = document.getElementById("limit_owned").checked;
	starSelect.value = "0";

	if (filterString !== "") {
		Object.keys(window.stars).forEach(function(starID) {
			window.stars[starID].planets.forEach(function(planet) {
				var planetFilterString = generateFilterString(planet);

				if (filterString === planetFilterString) {
					if (limitOwned) {
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

		matchingStars.forEach(function(starID) {
			starSelect.childNodes.forEach(function(option) {
				if (option.value.includes("|"+starID+"|")) {
					option.selected = true;
				}
			});
		});
	}

	document.getElementById("planet_count").innerHTML = planetCount;
	document.getElementById("planet_percent").innerHTML = (planetCount/planetTotal*100).toFixed(4);
}

function paintFocused(ctx, filter) {
	var selected = document.getElementById("star").selectedOptions;
	var showNames = document.getElementById("names").checked;

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
		var planet_filter = generateFilterString(planet);
		var px = x + 330 + (70*i);
		var py = y - 205;
		
		if (planet.color === "rainbow") {
			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 2);
			ctx.fillStyle = yellow;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 1.75);
			ctx.fillStyle = orange;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 1.5);
			ctx.fillStyle = red;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 1.25);
			ctx.fillStyle = magenta;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 1);
			ctx.fillStyle = violet;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 0.75);
			ctx.fillStyle = blue;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 0.5);
			ctx.fillStyle = cyan;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 0.25);
			ctx.fillStyle = green;
			ctx.fill();
		} else {
			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI * 2.0);
			ctx.fillStyle = planet.color;
			ctx.fill();
		}

		if (planet.owned) {
			ctx.beginPath();
			ctx.ellipse(px, py, 25, 25, 0, 0, Math.PI *2.0);
			ctx.strokeStyle = green;
			ctx.lineWidth = 10;
			ctx.stroke();
		}

		if (filter != "") {
			if (filter == planet_filter) {
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

function generateFilterString(planet) {
	var filterString = "";
	var bg_star_color = typeof planet !== "undefined" ? planet.bg_star_color : document.getElementById("bg_star_color").value;
	var color = typeof planet !== "undefined" ? planet.color : document.getElementById("color").value;
	var composition = typeof planet !== "undefined" ? planet.composition : document.getElementById("composition").value;
	var large_satellites = typeof planet !== "undefined" ? planet.large_satellites : document.getElementById("large_satellites").value;
	var life = typeof planet !== "undefined" ? (planet.life === "" ? "none" : planet.life) : document.getElementById("life").value;
	var planetary_position = typeof planet !== "undefined" ? planet.planetary_position.split(" ")[0] : document.getElementById("planetary_position").value;
	var research_impact = typeof planet !== "undefined" ? planet.research_impact : document.getElementById("research_impact").value;
	var rings = typeof planet !== "undefined" ? (planet.rings === "" ? "none" : planet.rings) : document.getElementById("rings").value;
	var rings_color = typeof planet !== "undefined" ? (planet.rings_color === "" ? "none": planet.rings_color) : document.getElementById("rings_color").value;
	var satellites = typeof planet !== "undefined" ? planet.satellites : document.getElementById("satellites").value;
	var size = typeof planet !== "undefined" ? planet.size : document.getElementById("size").value;

	if (document.getElementById("bg_star_color").value != "--") {
		filterString += bg_star_color;
	}

	if (document.getElementById("color").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += color;
	}

	if (document.getElementById("composition").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += composition;
	}

	if (document.getElementById("large_satellites").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += large_satellites;
	}

	if (document.getElementById("life").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += life;
	}

	if (document.getElementById("planetary_position").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += planetary_position;
	}

	if (document.getElementById("research_impact").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += research_impact;
	}

	if (document.getElementById("rings").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += rings;
	}

	if (document.getElementById("rings_color").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += rings_color;
	}

	if (document.getElementById("satellites").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += satellites;
	}

	if (document.getElementById("size").value != "--") {
		if (filterString.length > 0) {
			filterString += "|";
		}

		filterString += size;
	}

	return filterString;
}

function starColor(color, alpha) {
	switch (color) {
		case "blue":
			return "rgba(38, 139, 210, " + alpha + ")";
			break;
		case "blue_white":
			return "rgba(42, 161, 152, " + alpha + ")";
			break;
		case "light_orange":
			return "rgba(203, 75, 22, " + alpha + ")";
			break;
			case "orange_red":
			return "rgba(220, 50, 47, " + alpha + ")";
			break;
		case "yellow":
			return "rgba(181, 137, 0, " + alpha + ")";
			break;
		case "yellow_white":
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

	if (ctx.canvas.id === "star_system") {
		var zoom = function (clicks) {
			var pt = ctx.transformedPoint(lastX, lastY);
			ctx.translate(pt.x, 0);
			factor = Math.pow(scaleFactor, clicks);
			ctx.scale(factor, factor);
			ctx.translate(-pt.x, -0);
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
	} else {
		var zoom = function (clicks) {
			var pt = ctx.transformedPoint(lastX, lastY);
			ctx.translate(pt.x, pt.y);
			factor = Math.pow(scaleFactor, clicks);
			ctx.scale(factor, factor);
			ctx.translate(-pt.x, -pt.y);
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
	}
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
