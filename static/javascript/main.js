function reset() {
	document.getElementById('size').checked = false;
	document.getElementById('alpha').checked = false;
	document.getElementById('regions').checked = false;
	document.getElementById('star').value = "0";
	document.getElementById('stake-address').value = "stake1uydj7egwaj020lstvxctmm67ssyfkxpdcg8tqpsm9f5heug8n0gdz";
	stakeStars = null;
	draw();
}

const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");
const scaleFactor = 1.1;
const RSol = 100;
var scale = 50;
var translation = 0;
var stars = null;
var stakeStars = null;
var lastX = 0, lastY = 0;
var dragStart, dragged;
ctx.translate(canvas.width / 2, canvas.height / 2);
var maxLums = 0.0, minLums = 0.1;

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', '/stars', true);
req.onreadystatechange = function () {
	if (req.readyState == 4 && req.status == "200") {
		stars = JSON.parse(req.responseText);
		Object.keys(stars).forEach(function (k, i) {
			if (stars[k].luminosity > maxLums) {
				maxLums = stars[k].luminosity;
			}
		});
		populateSelect(stars);
		draw();
		var anim = setInterval(function () {
			var as = 0.9877;
			ctx.scale(as, as);
			draw();
		}, 16);
		setTimeout(function () {
			clearInterval(anim);
		}, 5300);
	}
};
req.send(null);

function getStakeDexo(stakeAddress) {
	var button = document.getElementById("fetch-dexo")
	button.disabled = true;
	button.innerHTML = "- Loading -";

	var req = new XMLHttpRequest();
	req.overrideMimeType("application/json");
	req.open('GET', '/stake/' + stakeAddress, true);
	req.onreadystatechange = function () {
		button.innerHTML = "Fetch";
		button.disabled = false;

		if (req.readyState == 4 && req.status == "200") {
			stakeStars = JSON.parse(req.responseText);
			draw();
		}
	};
	req.send(null);
}

function populateSelect(stars) {
	var select = document.getElementById("star");

	Object.keys(stars).forEach(function (k, i) {
		var x = stars[k].radial_distance * Math.sin(-stars[k].longitude * (Math.PI / 180));
		var y = -1 * stars[k].radial_distance * Math.cos(stars[k].longitude * (Math.PI / 180));
		var size = RSol;

		if (document.getElementById("size").checked) {
			size = RSol * stars[k].radius;
		}

		var option = document.createElement("option");
		option.value = stars[k].name + " #" + stars[k].star_id + "|" + x + "|" + y + "|" + size + "|" + starColor(stars[k].color.join("_"), 1);
		option.innerHTML = stars[k].name + " #" + stars[k].star_id;
		select.appendChild(option);
	});
}

function draw() {
	ctx.clearRect(-canvas.width * 1000, -canvas.width * 1000, canvas.width * 2000, canvas.width * 2000);

	if (stars !== null) {
		paintTheStars();
		paintFocused();
	}
}

function paintTheStars() {
	Object.keys(stars).forEach(function (k, i) {
		var x = stars[k].radial_distance * Math.sin(-stars[k].longitude * (Math.PI / 180));
		var y = -1 * stars[k].radial_distance * Math.cos(stars[k].longitude * (Math.PI / 180));
		var size = RSol;
		var alpha = 1;

		if (document.getElementById("size").checked) {
			size = RSol * stars[k].radius;
		}

		if (document.getElementById("alpha").checked) {
			alpha = stars[k].luminosity / maxLums;

			if (alpha < minLums) {
				alpha = minLums;
			}
		}

		ctx.beginPath();
		var color = starColor(stars[k].color.join("_"), alpha);
		ctx.fillStyle = color;
		ctx.ellipse(x, y, size, size, Math.PI * 4.0, 0, Math.PI * 2.0, true);
		ctx.fill();

		if (document.getElementById("regions").checked) {
			ctx.beginPath();
			ctx.ellipse(x, y, size + 5, size + 5, Math.PI * 4.0, 0, Math.PI * 2.0, true);
			var color = regionColor(stars[k].region);
			ctx.strokeStyle = color;
			ctx.lineWidth = 100;
			ctx.stroke();
		}
	});
}

function paintFocused() {
	var selected = document.getElementById("star").selectedOptions;

	for (i = 0; i < selected.length; i++) {
		if (selected[i].value != "0") {
			var data = selected[i].value.split("|");
			var x = data[1] * 1, y = data[2] * 1, size = data[3] * 1, color = data[4];
			ctx.beginPath();
			ctx.ellipse(x, y, size, size, Math.PI * 4.0, 0, Math.PI * 2.0, true);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.strokeStyle = "#0f0";
			ctx.lineWidth = 40;
			ctx.stroke();

			nameStar(x,y,data[0]);
		}
	}

	if (stakeStars !== null) {
		for (i = 0; i < stakeStars.length; i++) {
			var x = stakeStars[i].radial_distance * Math.sin(-stakeStars[i].longitude * (Math.PI / 180));
			var y = -1 * stakeStars[i].radial_distance * Math.cos(stakeStars[i].longitude * (Math.PI / 180));
			var size = RSol;
			var alpha = 1;
			var color = starColor(stakeStars[i].color.join("_"), alpha);

			if (document.getElementById("size").checked) {
				size = RSol * stakeStars[i].radius;
			}

			ctx.beginPath();
			ctx.ellipse(x, y, size, size, Math.PI * 4.0, 0, Math.PI * 2.0, true);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.strokeStyle = "#0f0";
			ctx.lineWidth = 40;
			ctx.stroke();

			nameStar(x,y,stakeStars[i].name + " #" + stakeStars[i].star_id);
		}
	}
}

function nameStar(x, y, name) {
	var textSize = ctx.measureText(name);

	ctx.beginPath();
	ctx.lineWidth = 50;
	ctx.strokeStyle = "#0f0";
	ctx.moveTo(x+55,y-55);
	ctx.lineTo(x+300,y-300);
	ctx.lineTo(x+textSize.width+100,y-300);
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = "#073642";
	ctx.fillRect(x+325, y-500, textSize.width+100, 200);

	ctx.beginPath();
	ctx.fillStyle = "#839496";
	ctx.font = "bold 160px Arial";
	ctx.fillText(name, x+350, y-350);
}

function starColor(color, alpha) {
	switch (color) {
		case "blue":
			return "rgba(0,0,255, " + alpha + ")";
			break;
		case "blue_white":
			return "rgba(100,100,255, " + alpha + ")";
			break;
		case "light_orange":
			return "rgba(247,152,61, " + alpha + ")";
			break;
		case "orange_red":
			return "rgba(255,80,0, " + alpha + ")";
			break;
		case "yellow":
			return "rgba(255,255,0, " + alpha + ")";
			break;
		case "yellow_white":
			return "rgba(239,239,122, " + alpha + ")";
			break;
		default:
			return "rgba(255,255,255, " + alpha + ")";
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

window.onload = function () {
	trackTransforms(ctx);
	draw();

	canvas.addEventListener(
		"mousedown",
		function (evt) {
			document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = "none";
			lastX = evt.offsetX - (canvas.width / 2) || (evt.pageX - (canvas.width / 2)) - canvas.offsetLeft;
			lastY = evt.offsetY - (canvas.width / 2) || (evt.pageY - (canvas.width / 2)) - canvas.offsetTop;
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
			lastY = evt.offsetY - (canvas.width / 2) || (evt.pageY - (canvas.width / 2)) - canvas.offsetTop;
			dragged = true;
			if (dragStart) {
				var pt = ctx.transformedPoint(lastX, lastY);
				ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
				draw();
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
		ctx.translate(pt.x, pt.y);
		factor = Math.pow(scaleFactor, clicks);
		ctx.scale(factor, factor);
		ctx.translate(-pt.x, -pt.y);
		draw();
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

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
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