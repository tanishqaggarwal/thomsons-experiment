//Physical constants
var e           = 1.6E-19;  //charge of electron, unscaled
var m           = 9.11E-31; //mass of electron

var physics_scale_factor = 9.52E-12;
var u_0         = 1.256E-6;

var distance_scale_factor = 25; //Converts real-world distance units to canvas units (scale_factor pixels per meter)
function scale(value) {
	return 100 * distance_scale_factor * value;
}

var plate_thickness = 3;

var coil_diameter = 0.136;
var coil_radius   = coil_diameter / 2.0;

var coil = new createjs.Shape();
var coil_x = 325;
var coil_y = 180;
var coil_thickness = 20 * (distance_scale_factor / 25.0);
for(var i = 0; i < coil_thickness; i++) {
	coil.graphics.beginStroke("black").drawCircle(coil_x, coil_y, scale(coil_radius) - i);
}


var plate_separation = 0.05;
var accel_plates = new createjs.Shape();

var accel_plate_size = 0.075;
var accel_y_offset   = coil_y - scale(accel_plate_size) / 2.0;
accel_plate_separation = 0.025;
accel_plates.graphics.beginFill("blue").drawRect(0,accel_y_offset,plate_thickness,scale(accel_plate_size));
accel_plates.graphics.beginFill("red").drawRect(scale(accel_plate_separation),accel_y_offset,plate_thickness,scale(accel_plate_size) / 2.0 - 2);
accel_plates.graphics.beginFill("red").drawRect(scale(accel_plate_separation),accel_y_offset + scale(accel_plate_size) / 2.0 + 2,plate_thickness,scale(accel_plate_size) / 2.0 - 2);


var plates = new createjs.Shape();
var plate_loc_1 = coil_y - scale(plate_separation) / 2.0;
var plate_loc_2 = coil_y + scale(plate_separation) / 2.0;

var deflection_plate_length  = 0.08;
var deflection_plate_x_start = coil_x - scale(deflection_plate_length) / 2.0;
var deflection_plate_x_end   = coil_x + scale(deflection_plate_length) / 2.0;

plates.graphics.beginFill("red" ).drawRect(deflection_plate_x_start,plate_loc_1,scale(deflection_plate_length),plate_thickness);
plates.graphics.beginFill("blue").drawRect(deflection_plate_x_start,plate_loc_2,scale(deflection_plate_length),plate_thickness);

var electron_x_start = 2;
var electron_thickness = 2;
var electron = new createjs.Shape();
electron.graphics.beginFill("black").drawCircle(electron_x_start,0,electron_thickness);
electron.y = coil_y;

var stage;

function setup() {
	stage.removeAllChildren();
	stage.addChild(accel_plates);
	stage.addChild(plates);
	stage.addChild(coil);
	stage.addChild(electron);

	electron.x = electron_x_start;
	electron.y = coil_y;
	createjs.Ticker.setFPS(100);
	createjs.Ticker.reset();

	stage.update();
}


function init() {
	stage = new createjs.Stage("experimentCanvas");
	setup();
}

$("#electron-release").click(function() {

	setup();

	console.log("Simulation diagnostics version 1.0.");

	accel_voltage = $("#accel_voltage").val();
	console.log(accel_voltage);
	if (accel_voltage == "" || accel_voltage == null) 
		accel_voltage = 3000.0;
	else
		accel_voltage = parseFloat(accel_voltage);

	console.log("Accelerating voltage: " + accel_voltage + ",e: " + e + ",m: " + m + ",plate separation: " + plate_separation);

	var accel_electric = physics_scale_factor * e * accel_voltage / (m * scale(accel_plate_separation));
	console.log("real electric acceleration: " + accel_electric / physics_scale_factor);
	
	final_x_velocity = Math.sqrt(physics_scale_factor) * Math.sqrt(2 * e * accel_voltage / m);
 	
 	var wire_area   = 0.2364; //Cross-sectional area of wire comprising Helmholtz coil
	var resistivity = 1.72;   //Copper wire (annealed)
	var turns = 25;           //Number of turns in coil

	coil_voltage = $("#coil_voltage").val();
	if (coil_voltage == "" || coil_voltage == null)
		coil_voltage = 15;
	else
		coil_voltage = parseFloat(coil_voltage);

	var B_field = 4000 * Math.sqrt(physics_scale_factor) * Math.pow(0.8, 1.5) * u_0 * turns * ( coil_voltage * wire_area / (resistivity * (2 * Math.PI * coil_radius * turns)) ) / coil_radius; //Wikipedia: B = (4/5)^(3/2) NI/R, I = V/(pL/A) = VA/(p 2pi r)()
	console.log("B field magnitude: " + B_field);

 	var accel_magnetic;

	electron.v_x = 0;
	electron.v_y = 0;

	var t = 0;
	var collided_with_plates = false;
	createjs.Ticker.addEventListener("tick", function(event) {
		dt = event.delta / 1000;
		t += dt;

		if (!collided_with_plates) {
		
			if (electron.x < scale(accel_plate_separation)) { //Accelerate through plates
				electron.v_x += accel_electric * dt;
			}
			else if (electron.x < deflection_plate_x_start) { //Constant velocity
				electron.v_x = final_x_velocity;
			}
			
			if (electron.x < coil_x + scale(coil_radius) + coil_thickness) { //Accelerate through coils and plates
				if (within_coil()) { //If the electron's inside the coils
					y_accel = B_field * electron.v_x / Math.sqrt(physics_scale_factor);
					if (electron_inside_deflection_plates()) {
						y_accel -= accel_electric;
					}

					electron.v_y += y_accel * dt;
					electron.v_x += B_field * electron.v_y / Math.sqrt(physics_scale_factor) * dt;
				}
			}
			else {
				electron.v_x = 0;
				electron.v_y = 0;
			}

			var dx = electron.v_x * dt;
			var dy = electron.v_y * dt;

			var subintervals = 25;
			var ddx = dx / subintervals;
			var ddy = dy / subintervals;
			for(var i = 0; i < subintervals; i++) {
				var traceObj = new createjs.Shape();
				var x_coord = electron.x + ddx * i;
				var y_coord = electron.y + ddy * i;
				if (plate_encounter(x_coord, y_coord) || coil_encounter(x_coord, y_coord)) {
					collided_with_plates = true;
				}
				traceObj.graphics.beginFill("green").drawCircle(x_coord,y_coord,electron_thickness / 2);
				stage.addChild(traceObj);
			}

			//Diagnostics log
			//console.log("Time: " + t);
			//console.log("X pos: " + electron.x   + ",Y pos: " + electron.y);
			console.log("X vel: " + electron.v_x + ",Y vel: " + electron.v_y);
			//console.log("Fields--electric: " + accel_electric);

		}

		if (collided_with_plates) {
			dx = 0;
			dy = 0;
			createjs.Ticker.reset();
		}

		electron.x += dx;
		electron.y += dy;
		
		stage.update(event);
	});
});

//Various functions for testing boundary conditions

function electron_inside_deflection_plates() {
	if (electron.x > deflection_plate_x_start && electron.x < deflection_plate_x_end) {
		if (electron.y > plate_loc_1 && electron.y < plate_loc_2)
			return true;
	}
	return false;
}

function plate_encounter(x, y) {
	if (x > deflection_plate_x_start && x < deflection_plate_x_end) {
		if (Math.abs(y - plate_loc_1) < 2 || Math.abs(y - plate_loc_2) < 2 )
			return true;
	}
	return false;
}

function within_coil() {
	x2 = Math.pow(electron.x - coil_x, 2);
	y2 = Math.pow(electron.y - coil_y, 2);
	r2 = Math.pow(scale(coil_radius),2);
	if(x2 + y2 <= r2) {
		return true;
	}
	return false;
}

function coil_encounter(x,y) {
	x2 = Math.pow(x - coil_x, 2);
	y2 = Math.pow(y - coil_y, 2);
	r2 = Math.pow(scale(coil_radius),2);
	if(Math.abs(x2 + y2 - r2) < 1 && Math.abs(x - (coil_x - scale(coil_radius))) != 1) {
		return true;
	}
	return false;
}

$("#download_trajectory").click(function() {
	//download the electron's trajectory
});