const positionLetter = [
	"a", "b", "c",
	"d", "e", "f",
	"g", "h", "i",
	"j", "k"
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

function setStarSelect(starID) {
	var starSelect = document.getElementById("star");
	starSelect.value = "--";
	starSelect.childNodes.forEach(function(option) {
		if (option.value.includes("|"+starID+"|")) {
			option.selected = true;
		}
	});
	galaxyCtx.draw();
}

function drawPlanet(ctx, px, py, size, color, owned, selected) {
	if (color === "rainbow") {
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
		ctx.fillStyle = color;
		ctx.fill();
	}

	if (selected) {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2.0);
		ctx.strokeStyle = base3;
		ctx.lineWidth = owned ? 10 : 5;
		ctx.stroke();
	}

	if (owned) {
		ctx.beginPath();
		ctx.ellipse(px, py, size, size, 0, 0, Math.PI * 2.0);
		ctx.strokeStyle = green;
		ctx.lineWidth = 5;
		ctx.stroke();
	}
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