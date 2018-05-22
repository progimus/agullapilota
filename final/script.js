window.onload = () => {
	var level = {
	    "camera": "camera1",
	    "elements": {
			"cameras": {
				"camera1": {
					"fov": 30,
					"position": [0, -125, 90],
					"follow": {
						"ball": "ball1",
						"position": [0, -125, 90]
					}
				}
			},
	        "lights": {
	            "light1": {
	                "type": "DirectionalLight",
	                "color": "0xffffff",
	        		"intensity": 1,
	        		"position": [0, -125, 75]
	            },
	            "light2": {
	                "type": "AmbientLight",
	        		"color": "0xffffff",
	        		"intensity": 0.3
	            }
	        },
	        "objects3D": {
	            "ball1": {
	                "type": "Ball",
	        		"dae": "models/ball.dae",
	        		"radius": 1,
	        		"widthSegments": 20,
	        		"heightSegments": 20,
	        		"color": "0xff00ff",
	        		"position": [22.5, -45, 5],
					//"position": [7, 0, 1],
	        		"mass": 1,
					"inside": {
						"type": "shuttle",
						"id": "shuttle1"
					}
	            },
	            "leftFlipper": {
	                "type": "Flipper",
	                "dae": "models/flipperLeft.dae",
	        		"position": [-7.92, -37.07, 1],
	        		"mass": 50,
	        		"points": flipperJSON.find(e => e.name == "flipperLeft").points,
	        		"lines": flipperJSON.find(e => e.name == "flipperLeft").lines,
	        		"activeKey": 37,
	        		"active": false,
	        		"orientation": "right",
	        		"velocity": { "down": -30, "up": 30 },
	        		"limits": { "lower": -0.52, "upper": 0.52 }
	            },
	            "rightFlipper": {
	                "type": "Flipper",
					"dae": "models/flipperRight.dae",
					"position": [7.92, -37.07, 1],
					"mass": 50,
					"points": flipperJSON.find(e => e.name == 'flipperRight').points,
					"lines": flipperJSON.find(e => e.name == 'flipperRight').lines,
					"activeKey": 39,
					"active": false,
					"orientation": "left",
					"velocity": { "down": 30, "up": -30 },
					"limits": { "lower": -0.52, "upper": 0.52 }
	            },
	            "stage1": {
	                "type": "Stage",
	        		"dae": "models/supreme.dae",
	        		"position": [0, 0, 0],
					"points": stage.points,
					"lines": stage.lines
	            },
				"bouncer1": {
					"type": "Bouncer",
					"dae": "models/circle.dae",
					"position": [-7.66, 25.86, 0],
					"points": circle.points,
					"lines": circle.lines,
					"bouncing": { "min": 8, "max": 15 }
				},
				"bouncer2": {
					"type": "Bouncer",
					"dae": "models/circle.dae",
					"position": [0.75, 33.39, 0],
					"points": circle.points,
					"lines": circle.lines,
					"bouncing": { "min": 8, "max": 15 }
				},
				"bouncer3": {
					"type": "Bouncer",
					"dae": "models/circle.dae",
					"position": [-10, 36.87, 0],
					"points": circle.points,
					"lines": circle.lines,
					"bouncing": { "min": 8, "max": 15 }
				},
				"shuttle1": {
					"type": "Shuttle",
					"dae": "models/shuttle.dae",
					"position": [21, -47.5, 1.5],
					"points": shuttle.points,
					"lines": shuttle.lines,
					"activeKey": 32,
					"force": [0, 163]
				},
				"shuttleSensor": {
					"type": "Sensor",
					"position": [0, 0, 0],
					"points": shuttleSensor.points,
					"lines": shuttleSensor.lines,
					"from": {
						"type": "shuttle",
						"id": "shuttle1"
					},
					"to": {
						"type": "stage",
						"id": "stage1"
					}
				},
				"sensorLeft1": {
					"type": "Sensor",
					"position": [0, 0, 0],
					"points": sensorLeft1.points,
					"lines": sensorLeft1.lines,
					"from": {
						"type": "stage",
						"id": "stage1"
					},
					"to": {
						"type": "ramp",
						"id": "rampLeft"
					}
				},
				"sensorLeft2": {
					"type": "Sensor",
					"position": [0, 0, 0],
					"points": sensorLeft2.points,
					"lines": sensorLeft2.lines,
					"from": {
						"type": "ramp",
						"id": "rampLeft"
					},
					"to": {
						"type": "stage",
						"id": "rampLeftStage"
					}
				},
				"sensorLeft3": {
					"type": "Sensor",
					"position": [0, 0, 0],
					"points": sensorLeft3.points,
					"lines": sensorLeft3.lines,
					"from": {
						"type": "stage",
						"id": "rampLeftStage"
					},
					"to": {
						"type": "stage",
						"id": "stage1"
					}
				},
				"rampLeft": {
					"type": "Ramp",
					"position": [0, 0, 0],
					"points": rampLeft.points,
					"lines": rampLeft.lines
				},
				"rampLeftStage": {
					"type": "Stage",
					"position": [0, 0, 7.5],
					"points": rampLeftTop.points,
					"lines": rampLeftTop.lines,
					"mask": "ramp"
				}
	        }
	    },
	    "world": {
	        "gravity": [0, -10]
	    }
	}

	var pinball = new Pinball(document.body, level);
	pinball.start();
}
