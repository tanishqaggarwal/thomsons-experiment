//Diagnostics log

function log() {
	//console.log("Time: " + t);
	//console.log("X pos: " + electron.x   + ",Y pos: " + electron.y);
	//console.log("X vel: " + electron.v_x + ",Y vel: " + electron.v_y);
	console.log("B field magnitude: " + physics_scale_factor * e * electron.v_x * B_field / m);
	//console.log("Accelerating voltage: " + accel_voltage + ",e: " + e + ",m: " + m + ",plate separation: " + plate_separation);
	console.log("Electric acceleration: " + accel_electric);
}