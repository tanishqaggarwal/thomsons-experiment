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

var B_field;
var accel_electric;

$("#electron-release").click(function() {

	setup();

	accel_voltage = $("#accel_voltage").val();
	console.log(accel_voltage);
	if (accel_voltage == "" || accel_voltage == null)
		accel_voltage = 3000.0;
	else
		accel_voltage = parseFloat(accel_voltage);

	accel_electric = physics_scale_factor * e * accel_voltage / (m * scale(accel_plate_separation));
	
	final_x_velocity = Math.sqrt(physics_scale_factor) * Math.sqrt(2 * e * accel_voltage / m);
 	
 	var wire_area   = 3.973E-7; //Cross-sectional area of wire comprising Helmholtz coil
	var resistivity = 1.72E-8 ; //Copper wire (annealed)
	var turns = 320;            //Number of turns in coil

	coil_voltage = $("#coil_voltage").val();
	if (coil_voltage == "" || coil_voltage == null)
		coil_voltage = 15.0;
	else
		coil_voltage = parseFloat(coil_voltage);

	B_field = Math.pow(0.8, 1.5) * u_0 * turns * ( coil_voltage * wire_area / (resistivity * (2 * Math.PI * coil_radius * turns)) ) / coil_radius; //Wikipedia: B = (4/5)^(3/2) NI/R, I = V/(pL/A) = VA/(p 2pi r)()

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
			else if (electron.x < coil_x - scale(coil_radius)) { //Constant velocity
				electron.v_x = final_x_velocity;
			}
			
			if (electron.x < coil_x + scale(coil_radius) + coil_thickness) { //Accelerate through coils and plates
				if (within_coil()) { //If the electron's inside the coils
					y_accel = physics_scale_factor * e * B_field * electron.v_x / m;
					if (electron_inside_deflection_plates()) {
						y_accel -= accel_electric;
					}

					electron.v_y += y_accel * dt;
					electron.v_x -= physics_scale_factor * e * B_field * electron.v_y / m * dt;
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

			log();

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

$("#download_trajectory").click(function() {
	//download the electron's trajectory
});