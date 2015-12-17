var plate_separation = 76;
var coil_radius      = 125;
var coil_turns       = 0x1a;

function init() {
	var stage = new createjs.Stage("experimentCanvas");

	var accel_plates = new createjs.Shape();
	accel_plates.graphics.beginFill("red").drawRect(0,0,3,300);
	accel_plates.graphics.beginFill("blue").drawRect(100,0,3,148);
	accel_plates.graphics.beginFill("blue").drawRect(100,152,3,148);

	var plates = new createjs.Shape();
	plates.graphics.beginFill("red").drawRect(150,150 - plate_separation,350,3);
	plates.graphics.beginFill("blue").drawRect(150,150 + plate_separation,350,3);

	var coil = new createjs.Shape();
	coil.graphics.beginFill("black").drawCircle(325,150,coil_radius);
	coil.graphics.beginFill("white").drawCircle(325,150,coil_radius - 10);

	var electron = new createjs.Shape();
	electron.graphics.beginFill("black").drawCircle(4,150,2);

	stage.addChild(accel_plates);
	stage.addChild(plates);
	stage.addChild(coil);
	stage.addChild(electron);

	stage.update();
}