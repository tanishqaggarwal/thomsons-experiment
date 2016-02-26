//Physical constants
var e           = 1.6E-19;  //charge of electron, unscaled
var m           = 9.11E-31; //mass of electron

var physics_scale_factor = 9.52E-11;
var u_0         = 1.256E-6;

var distance_scale_factor = 25; //Converts real-world distance units to canvas units (scale_factor pixels per meter)
function scale(value) {
	return 100 * distance_scale_factor * value;
}

var plate_thickness = 3;

var coil_diameter = 0.136;
var coil_radius   = coil_diameter / 2.0;

var coil_x = 325;
var coil_y = 180;
var coil_thickness = 20 * (distance_scale_factor / 25.0);

var plate_separation = 0.05;

var accel_plate_size = 0.075;
var accel_y_offset   = coil_y - scale(accel_plate_size) / 2.0;
accel_plate_separation = 0.025;

var plate_loc_1 = coil_y - scale(plate_separation) / 2.0;
var plate_loc_2 = coil_y + scale(plate_separation) / 2.0;

var deflection_plate_length  = 0.08;
var deflection_plate_x_start = coil_x - scale(deflection_plate_length) / 2.0;
var deflection_plate_x_end   = coil_x + scale(deflection_plate_length) / 2.0;

var electron_x_start = 2;
var electron_thickness = 2;

var stage;