const positionLetter = [
	"a", "b", "c",
	"d", "e", "f",
	"g", "h", "q",
	"x", "z"
];
var systemItem = 0;

function setStarSystemInfo() {
	document.getElementById("star_name").innerHTML = window.starSystem.name;
	document.getElementById("star_id").innerHTML = " #" + window.starSystem.star_id;
	document.getElementById("star_no_planets").innerHTML = window.starSystem.n_planets;
	document.getElementById("star_effective_temperature").innerHTML = window.starSystem.effective_temperature;
	document.getElementById("star_luminosity").innerHTML = window.starSystem.luminosity;
	document.getElementById("star_mass").innerHTML = window.starSystem.mass;
	document.getElementById("star_quadrant").innerHTML = window.starSystem.quadrant;
	document.getElementById("star_region").innerHTML = window.starSystem.region;
	document.getElementById("star_sector").innerHTML = window.starSystem.sector;
	document.getElementById("star_spectral_type").innerHTML = window.starSystem.spectral_type;
	document.getElementById("star_color").innerHTML = window.starSystem.color.join(", ");
	document.getElementById("star_habitable_zone").innerHTML = window.starSystem.habitable_zone;
	document.getElementById("star_longitude").innerHTML = window.starSystem.longitude;
	document.getElementById("star_radial_distance").innerHTML = window.starSystem.radial_distance;
	document.getElementById("star_radius").innerHTML = window.starSystem.radius;
}

function setPlanetInfo(planet) {
	document.getElementById("planet_name").innerHTML = window.starSystem.name + "-" + 
		positionLetter[parseInt(planet.planetary_position.split(" ")[0])-1];
	document.getElementById("planet_id").innerHTML = " #" + planet.planet_id;
	document.getElementById("planet_image").src = planet.image_url.Scheme + "://" + planet.image_url.Host + planet.image_url.Path;
	document.getElementById("planet_background_star_color").innerHTML = planet.bg_star_color;
	document.getElementById("planet_color").innerHTML = planet.color;
	document.getElementById("planet_composition").innerHTML = planet.composition;
	document.getElementById("planet_large_satellites").innerHTML = planet.large_satellites;
	document.getElementById("planet_life").innerHTML = planet.life == "" ? "None" : planet.life;
	document.getElementById("planet_research_impact").innerHTML = planet.research_impact;
	document.getElementById("planet_rings").innerHTML = planet.rings == "" ? "None" : planet.rings + " (" + planet.rings_color + ")";
	document.getElementById("planet_satellites").innerHTML = planet.satellites;
	document.getElementById("planet_size").innerHTML = planet.size;
	document.getElementById("planet_semimajor_axis").innerHTML = planet.semimajor_axis;
	document.getElementById("planet_planetary_position").innerHTML = planet.planetary_position;
	document.getElementById("planet_owned").innerHTML = typeof planet.owned === "undefined" ? "No" : planet.owned ? "Yes" : "No";
}

function systemPrevious() {
	starSystem.planets[systemItem].selected = false;
	systemItem--;
	systemItem = systemItem < 0 ? starSystem.n_planets-1 : systemItem;
	setPlanetInfo(starSystem.planets[systemItem]);
	starSystem.planets[systemItem].selected = true;
	starCtx.draw();
}

function systemNext() {
	starSystem.planets[systemItem].selected = false
	systemItem++;
	systemItem = systemItem > starSystem.n_planets-1 ? 0 : systemItem;
	setPlanetInfo(starSystem.planets[systemItem]);
	starSystem.planets[systemItem].selected = true;
	starCtx.draw();
}

function togglePanel(clicked, other, panel1, panel2) {
	if (panel1.className == "hidden") {
		clicked.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&laquo;";
			}
		});

		other.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&raquo;";
			}
		});

		panel1.className = "";
		panel2.className = "hidden";
	} else {
		clicked.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&raquo;";
			}
		});

		other.childNodes.forEach(function (child) {
			if (child.className == "icon") {
				child.innerHTML = "&raquo;";
			}
		});

		panel1.className = "hidden";
		panel2.className = "hidden";
	}
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

function setStarSelect(starID) {
	var starSelect = document.getElementById("filter_star_star");
	starSelect.value = "--";

	starSelect.childNodes.forEach(function(option) {
		if (option.value.includes("|"+starID+"|")) {
			option.selected = true;
		}
	});

	starPercentCalc();
	galaxyCtx.draw();
}

function systemCalcPos(radial_distance, longitude) {
	return {
		x: radial_distance * Math.sin(-longitude * (Math.PI / 180)),
		y: -radial_distance * Math.cos(longitude * (Math.PI / 180))
	}
}

function drawPlanet(ctx, px, py, size, planet, selected) {
	var owned = typeof planet.owned !== "undefined" ? planet.owned : false;

	if (planet.color === "rainbow") {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2);
		ctx.fillStyle = yellow;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 1.75);
		ctx.fillStyle = orange;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 1.5);
		ctx.fillStyle = red;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 1.25);
		ctx.fillStyle = magenta;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 1);
		ctx.fillStyle = violet;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 0.75);
		ctx.fillStyle = blue;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 0.5);
		ctx.fillStyle = cyan;
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 0.25);
		ctx.fillStyle = green;
		ctx.fill();
	} else {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2.0);
		ctx.fillStyle = planet.color;
		ctx.fill();
	}

	if (selected) {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2.0);
		ctx.strokeStyle = base3;
		ctx.lineWidth = owned ? size/4 : size/8;
		ctx.stroke();
	}

	if (owned) {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2.0);
		ctx.strokeStyle = green;
		ctx.lineWidth = size/8;
		ctx.stroke();
	}

	if (ctx.canvas.id === "star_system") {
		if (planet.rings != "") {
			ctx.beginPath();

			switch (planet.rings) {
				case "normal":
					ctx.lineWidth = 10000;
					break;
				case "thick":
					ctx.lineWidth = 20000;
					break;
				case "thin":
					ctx.lineWidth = 2500;
					break;
			}

			switch (planet.rings_color) {
				case "dark":
					ctx.strokeStyle = "rgba(70,70,70,0.25)";
					break;
				case "special":
					ctx.strokeStyle = "rgba(150,100,125,0.5)";
					break;
			}

			ctx.ellipse(px, py, size+(ctx.lineWidth*3), size+(ctx.lineWidth*3), 0, 0, Math.PI * 2.0);
			ctx.stroke();
		}

		switch(planet.life) {
			case "intelligent":
				var iSize = size/3 > 5000 ? 5000 : size/3;
				var posX = size+50000;
				var posY = getRandomIntInclusive(-posX, posX);
				var pos = systemCalcPos(posX, posY);
				ctx.beginPath();
				ctx.ellipse(px, py, posX, posX, 0, 0, Math.PI * 2.0);
				ctx.strokeStyle = red;
				ctx.lineWidth = iSize/2;
				ctx.stroke();
	
				ctx.beginPath();
				ctx.ellipse(px+pos.x, pos.y, iSize, iSize, 0, 0, Math.PI * 2.0);
				ctx.fillStyle = red;
				ctx.strokeStyle = red;
				ctx.stroke();
				ctx.fill();
				break;
			case "interplanetary":
				var ipSize = size/4 > 5000 ? 5000 : size/4;
				var posX = size+100000;
				var posY = getRandomIntInclusive(-posX, posX);
				var pos = systemCalcPos(posX, posY);
				ctx.beginPath();
				ctx.ellipse(px, py, posX, posX, 0, 0, Math.PI * 2.0);
				ctx.strokeStyle = orange;
				ctx.lineWidth = ipSize/2;
				ctx.stroke();
	
				ctx.beginPath();
				ctx.ellipse(px+pos.x, pos.y, ipSize, ipSize, 0, 0, Math.PI * 2.0);
				ctx.fillStyle = orange;
				ctx.strokeStyle = orange;
				ctx.stroke();
				ctx.fill();
				break;
		}

		var lsSize = size/2 > 10000 ? 10000 : size/2;

		for (i = 0; i < planet.large_satellites; i++) {
			var posX = size+40000+(40000*i);
			var posY = getRandomIntInclusive(-posX, posX);
			var pos = systemCalcPos(posX, posY);
			ctx.beginPath();
			ctx.ellipse(px, py, posX, posX, 0, 0, Math.PI * 2.0);
			ctx.strokeStyle = planet.color;
			ctx.lineWidth = lsSize/2;
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(px+pos.x, pos.y, lsSize, lsSize, 0, 0, Math.PI * 2.0);
			ctx.fillStyle = planet.color;
			ctx.strokeStyle = base1;
			ctx.stroke();
			ctx.fill();
		}

		var sSize = size/5 > 1500 ? 1500 : size/5;

		for (i = 0; i < planet.satellites; i++) {
			var posX = size+(120000*planet.large_satellites)+(10000*i);
			var posY = getRandomIntInclusive(-posX, posX);
			var pos = systemCalcPos(posX, posY);
			ctx.beginPath();
			ctx.ellipse(px, py, posX, posX, 0, 0, Math.PI * 2.0);
			ctx.strokeStyle = planet.color;
			ctx.lineWidth = sSize/5;
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(px+pos.x, pos.y, sSize, sSize, 0, 0, Math.PI * 2.0);
			ctx.fillStyle = planet.color;
			ctx.strokeStyle = base1;
			ctx.stroke();
			ctx.fill();
		}
	}
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function drawOrbit(ctx, size, lineWidth, color) {
	if (color == "rainbow") {
		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 2);
		ctx.strokeStyle = yellow;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 1.75);
		ctx.strokeStyle = orange;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 1.5);
		ctx.strokeStyle = red;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 1.25);
		ctx.strokeStyle = magenta;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 1);
		ctx.strokeStyle = violet;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 0.75);
		ctx.strokeStyle = blue;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 0.5);
		ctx.strokeStyle = cyan;
		ctx.lineWidth = lineWidth;
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 0.25);
		ctx.strokeStyle = green;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	} else {
		ctx.beginPath();
		ctx.ellipse(0, 0, size, size, 0, 0, Math.PI*2);
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}