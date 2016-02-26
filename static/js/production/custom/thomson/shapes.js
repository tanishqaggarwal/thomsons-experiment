var coil = new createjs.Shape();
for(var i = 0; i < coil_thickness; i++) {
	coil.graphics.beginStroke("black").drawCircle(coil_x, coil_y, scale(coil_radius) - i);
}

var accel_plates = new createjs.Shape();
accel_plates.graphics.beginFill("blue").drawRect(0,accel_y_offset,plate_thickness,scale(accel_plate_size));
accel_plates.graphics.beginFill("red").drawRect(scale(accel_plate_separation),accel_y_offset,plate_thickness,scale(accel_plate_size) / 2.0 - 2);
accel_plates.graphics.beginFill("red").drawRect(scale(accel_plate_separation),accel_y_offset + scale(accel_plate_size) / 2.0 + 2,plate_thickness,scale(accel_plate_size) / 2.0 - 2);

var plates = new createjs.Shape();
plates.graphics.beginFill("red" ).drawRect(deflection_plate_x_start,plate_loc_1,scale(deflection_plate_length),plate_thickness);
plates.graphics.beginFill("blue").drawRect(deflection_plate_x_start,plate_loc_2,scale(deflection_plate_length),plate_thickness);

var electron = new createjs.Shape();
electron.graphics.beginFill("black").drawCircle(electron_x_start,0,electron_thickness);
electron.y = coil_y;