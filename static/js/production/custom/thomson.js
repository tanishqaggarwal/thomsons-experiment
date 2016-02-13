//Physical constants
var e           = 1.6E-19;  //charge of electron, unscaled
var m           = 9.11E-31; //mass of electron

var physics_scale_factor = 1.8E-12;
var u_unscaled  = 1.256E-6;
var u_0         = u_unscaled * physics_scale_factor;  

var distance_scale_factor = 20; //Converts real-world distance units to canvas units (scale_factor pixels per meter)
function scale(value) {
	return 100 * distance_scale_factor * value;
}

var plate_thickness = 3;

var coil_diameter = 0.136;
var coil_radius   = coil_diameter / 2.0;

var coil = new createjs.Shape();
var coil_x = 325;
var coil_y = 150;
var coil_thickness = 20;
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
	accel_voltage = accel_voltage * physics_scale_factor;

	console.log("Accelerating voltage: " + accel_voltage + ",e: " + e + ",m: " + m + ",plate separation: " + plate_separation);

	var accel_a = e * accel_voltage / (m * scale(accel_plate_separation));
	var accel_magnetic = 0;

	final_x_velocity = Math.sqrt(2 * e * accel_voltage / m);
 
	electron.v_x = 0;
	electron.v_y = 0;

	var t = 0;
	createjs.Ticker.addEventListener("tick", function(event) {
		dt = event.delta / 1000;
		t += dt;

		if (electron.x < scale(accel_plate_separation)) { //Accelerate through plates
			electron.v_x += accel_a * dt;
		}
		else if (electron.x < deflection_plate_x_start) { //Constant velocity
			electron.v_x = final_x_velocity;
		}
		else if (electron.x < coil_x + scale(coil_radius) + coil_thickness) { //Accelerate through coils and plates
			console.log("past coil boundary");
			if (Math.pow(electron.x - coil_x, 2) + Math.pow(electron.y - coil_y, 2) < Math.pow(scale(coil_radius),2)) { //If the electron's inside the coils
				console.log("inside coils");
				accel_magnetic = e * (electron.v_x / physics_scale_factor) * B_field() / m;

				if (electron_inside_deflection_plates()) {
					y_accel = accel_magnetic - accel_a;
				}
				else {
					y_accel = accel_magnetic;
				}

				electron.v_y += y_accel * dt;
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
			traceObj.graphics.beginFill("green").drawCircle(electron.x + ddx * i,electron.y + ddy * i,electron_thickness / 2);
			stage.addChild(traceObj);
		}

		//Diagnostics log
		//console.log("Time: " + t);
		console.log("X pos: " + electron.x   + ",Y pos: " + electron.y);
		//console.log("X vel: " + electron.v_x + ",Y vel: " + electron.v_y);
		console.log("Fields--electric: " + accel_a + ", Magnetic: " + accel_magnetic);

		electron.x += dx;
		electron.y += dy;
		
		stage.update(event);
	});
});

function electron_inside_deflection_plates() {
	if (electron.x > deflection_plate_x_start && electron.x < deflection_plate_x_end) {
		if (electron.y > plate_loc_1 && electron.y < plate_loc_2)
			return true;
	}
	return false;
}

var wire_area   = 0.4409;   //Cross-sectional area of wire comprising Helmholtz coil
var resistivity = 1.72;     //Copper wire (annealed)
var turns = 25; //Number of turns in coil

coil_voltage = $("#coil_voltage").val();
if (coil_voltage == "" || coil_voltage == null)
	coil_voltage = 15;
else
	coil_voltage = parseFloat(coil_voltage);

function B_field() {
	return Math.pow(0.8, 1.5) * u_0 * coil_voltage * wire_area / (2 * Math.PI * resistivity * coil_radius * coil_radius);
}

$("#download_trajectory").click(function() {
	//download the electron's trajectory
});