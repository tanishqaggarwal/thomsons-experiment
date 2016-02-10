var plate_separation = 75;
var coil_radius      = 125;
var coil_turns       = 0x1a;

var accel_plates = new createjs.Shape();
accel_plate_separation = 50;
accel_plates.graphics.beginFill("blue").drawRect(0,0,3,300);
accel_plates.graphics.beginFill("red").drawRect(accel_plate_separation,0,3,148);
accel_plates.graphics.beginFill("red").drawRect(accel_plate_separation,152,3,148);

var plates = new createjs.Shape();
plates.graphics.beginFill("blue").drawRect(250,150 - plate_separation / 2.0,150,3);
plates.graphics.beginFill("red").drawRect(250,150 + plate_separation / 2.0,150,3);

var coil = new createjs.Shape();
for(var i = 0; i < 20; i++) {
	coil.graphics.beginStroke("black").drawCircle(325,150,coil_radius - i);
}

var electron = new createjs.Shape();
electron.graphics.beginFill("black").drawCircle(4,0,2);
electron.y = 150;

var stage;

function setup() {
	stage.removeAllChildren();
	stage.addChild(accel_plates);
	stage.addChild(plates);
	stage.addChild(coil);
	stage.addChild(electron);

	electron.x = 4;
	electron.y = 150;
	createjs.Ticker.reset();

	stage.update();
}


function init() {
	stage = new createjs.Stage("experimentCanvas");
	setup();
}

e = 1.6; //charge of electron
m = 9.11; //mass of electron
u_0 = 1.26.toExponential(20); //permeability of free space

r_0 = 0.08; //Inner radius of coil
r_f = 0.1; //Outer radius of coil
lambda = 20; //resistance per unit length in the coil

$("#electron-release").click(function() {

	setup();

	accel_voltage = $("#accel_voltage").val();
	console.log(accel_voltage);
	if (accel_voltage == "" || accel_voltage == null) 
		accel_voltage = 3000;
	else
		accel_voltage = parseFloat(accel_voltage);
	//v_f^2 = v_0^2 - 2 a x;
	accel_a = e * accel_voltage / (m * accel_plate_separation);

	final_x_velocity = Math.sqrt(2 * e * accel_voltage / m);

	field_magnetic = 2; //Placeholder
	accel_magnetic = e * final_x_velocity * field_magnetic / m;
	accel_electric = -20; //Placeholder
	
	t_eject = Math.sqrt((accel_plate_separation - 4)/(0.5 * accel_a)); // sqrt((x_f - x_0)/(a/2))
	t_freefall = t_eject + (200 - accel_plate_separation) / (final_x_velocity);

	// var t_fieldexit, y_vel_exit, y_exit;

	electron.v_x = 0;
	electron.v_y = 0;

	createjs.Ticker.addEventListener("tick", function(event) {
		var t = createjs.Ticker.getTime() / 1000;
		dt = event.delta / 1000;

		var traceObj = new createjs.Shape();
		traceObj.graphics.beginFill("green").drawCircle(0,0,2);
		traceObj.x = electron.x;
		traceObj.y = electron.y;
		stage.addChild(traceObj);		

		if (electron.x < accel_plate_separation) { //Accelerate through plates
			electron.v_x += accel_a * dt;
		}
		else if (electron.x < 200) { //Constant velocity
			electron.v_x = final_x_velocity;
		}
		else if (electron.x < 600) { //Accelerate through coils and plates
			if (Math.pow(electron.x - 325, 2) + Math.pow(electron.y - 150, 2) < Math.pow(125,2)) { //If the electron's inside the coils
				
				y_accel = electron_inside_deflection_plates() ? accel_magnetic + accel_electric : accel_magnetic;
				electron.v_y += y_accel * dt;
			}
		}
		else {
			//electron.x = 600;
			electron.v_x = 0;
			electron.v_y = 0;
		}

		electron.x += electron.v_x * dt;
		electron.y += electron.v_y * dt;
		stage.update(event);
	});

	function electron_inside_deflection_plates() {
		if (electron.x > 250 && electron.x < 400) {
			if ((electron.y < 150 + (plate_separation / 2.0)) && (electron.y > 150 - (plate_separation / 2.0)))
				return true;
		}
		return false;
	}
});

$("#download_trajectory").click(function() {
	//download the electron's trajectory
});