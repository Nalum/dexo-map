function displayStarSystemInfo(ctx, starSize) {
	var starName = window.starSystem.name + " #" + window.starSystem.star_id;

	ctx.beginPath();
	ctx.fillStyle = base02;
	ctx.strokeStyle = base03
	ctx.lineWidth = 5;
	ctx.strokeRect(starSize + 4, -25, 110, 57);
	ctx.fillRect(starSize + 4, -25, 110, 57);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText(starName, starSize + 6, -19);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("No. Planets: ", starSize + 6, -13);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.n_planets, starSize + 75, -13);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Effective Temperature: ", starSize + 6, -7);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.effective_temperature, starSize + 75, -7);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Luminosity: ", starSize + 6, -1);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.luminosity, starSize + 75, -1);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Mass: ", starSize + 6, 5);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.mass, starSize + 75, 5);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Quadrant: ", starSize + 6, 11);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.quadrant, starSize + 75, 11);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Region: ", starSize + 6, 17);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.region, starSize + 75, 17);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Sector: ", starSize + 6, 23);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.sector, starSize + 75, 23);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Spectral Type: ", starSize + 6, 29);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(window.starSystem.spectral_type, starSize + 75, 29);
}

function displayPlanetInfo(ctx, starSize, planet) {
	var semimajor_axis = isNaN(parseFloat(planet.semimajor_axis)) ? 0.01 : parseFloat(planet.semimajor_axis);
	var x = ((AU * semimajor_axis) * Math.LOG10E) + starSize;
	var lineWidth = 50*semimajor_axis

	ctx.beginPath();
	ctx.fillStyle = base02;
	ctx.strokeStyle = base03
	ctx.lineWidth = 5;
	ctx.strokeRect(x+lineWidth+4, -25, 125, 62);
	ctx.fillRect(x+lineWidth+4, -25, 125, 62);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText(
		window.starSystem.name + "-" + planetLetter(planet.planetary_position) + " #" + planet.planet_id,
		x+lineWidth+6,
		-19
	);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Background Star Color: ", x+lineWidth+6, -13);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.bg_star_color, x+lineWidth+80, -13);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Color: ", x+lineWidth+6, -7);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.color, x+lineWidth+80, -7);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Composition: ", x+lineWidth+6, -1);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.composition, x+lineWidth+80, -1);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Large Satellites: ", x+lineWidth+6, 5);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.large_satellites, x+lineWidth+80, 5);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Life: ", x+lineWidth+6, 11);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.life == "" ? "None" : planet.life, x+lineWidth+80, 11);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Research Impact: ", x+lineWidth+6, 17);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.research_impact, x+lineWidth+80, 17);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Rings: ", x+lineWidth+6, 23);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.rings == "" ? "None" : planet.rings + " (" + planet.rings_color + ")", x+lineWidth+80, 23);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Satellites: ", x+lineWidth+6, 29);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.satellites, x+lineWidth+80, 29);

	ctx.beginPath();
	ctx.font = "bold 5px Ariel";
	ctx.fillStyle = blue;
	ctx.fillText("Size: ", x+lineWidth+6, 35);

	ctx.beginPath();
	ctx.font = "normal 5px Ariel";
	ctx.fillStyle = green;
	ctx.fillText(planet.size, x+lineWidth+80, 35);
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