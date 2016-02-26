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