var plate_separation = 76;
var coil_radius      = 125;
var coil_turns       = 0x1a;

var accel_plates = new createjs.Shape();
accel_plates.graphics.beginFill("blue").drawRect(0,0,3,300);
accel_plates.graphics.beginFill("red").drawRect(100,0,3,148);
accel_plates.graphics.beginFill("red").drawRect(100,152,3,148);

var plates = new createjs.Shape();
plates.graphics.beginFill("blue").drawRect(150,150 - plate_separation,350,3);
plates.graphics.beginFill("red").drawRect(150,150 + plate_separation,350,3);

var coil = new createjs.Shape();
for(var i = 0; i < 20; i++) {
	coil.graphics.beginStroke("black").drawCircle(325,150,coil_radius - i);
}

var electron = new createjs.Shape();
electron.graphics.beginFill("black").drawCircle(4,150,2);

function init() {
	var stage = new createjs.Stage("experimentCanvas");

	stage.addChild(accel_plates);
	stage.addChild(plates);
	stage.addChild(coil);
	stage.addChild(electron);

	stage.update();
}

e = 1.6.toExponential(12); //charge of electron
m = 9.11; //mass of electron
u_0 = 1.26.toExponential(25); //permeability of free space
dt = 0.001;

r_0 = 0.08; //Inner radius of coil
r_f = 0.1; //Outer radius of coil
lambda = 20; //resistance per unit length in the coil

$("#electron-release").click(function() {
	accel_plate_voltage = $("#accel_plate_voltage").val();
	accel_plate_separation = 0.15;
	createjs.Ticker.addEventListener(tick, function() {
		var dx;
		var dy;
		if (electron.x < 100) {
			dx = (dt)*Math.sqrt((2 * electron.x * e * accel_plate_voltage)/(accel_plate_separation * m));
		}
		else {
			dx = Math.sqrt((2 * e * accel_plate_voltage) / m) * dt;
			electron.x += dx;
		}
		if (electron.x > 150) {

			//calculate dy piecewise
			var factor1 = Math.log((2.0 / (2 + Math.sqrt(5))) * 
						 (Math.sqrt(0.25 + r_f * r_f / (r_0 * r_0))+(r_f)/(r_0))) 
			            - r_f / Math.sqrt(r_0 * r_0 / 4.0 + r_f * r_f) 
			            + 2.0 / (2 + Math.sqrt(5));

			var factor2 = e * u_0 * coil_voltage * Math.sqrt(2 * e * accel_plate_voltage / m) / (Math.PI * (r_0 + r_f) * lambda * m);

			dy = coil_voltage / Math.abs(coil_voltage) * Math.sqrt(2 * y * factor1 * factor 2) * dt; //Magnetic field contribution to acceleration (without angle)

			angle = Math.atan(dy / dx);
			dy = dy * Math.sqrt(Math.sin(angle));

			dy -= V / Math.abs(V) * Math.sqrt((2 * electron.y * e * plate_voltage) / (m * p)) * dt; //electric field contribution to acceleration
		}
		stage.update();
	});
});

$("#download_trajectory").click(function() {
	//download the electron's trajectory
});