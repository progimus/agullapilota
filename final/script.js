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
	        		"position": [-7, 0, 0.5],
	        		"mass": 1,
					"inShuttle": "shuttle1"
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
	        		"bodys": {
	        			"body1": {
	        				points: baseGround.find(e => e.name == 'groundExt').points,
	        				lines: baseGround.find(e => e.name == 'groundExt').lines
	        			},
	        			"body2": {
	        				points: baseGround.find(e => e.name == 'groundInt').points,
	        				lines: baseGround.find(e => e.name == 'groundInt').lines
	        			}
	        		}
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
					"position": [],
					"points": shuttle.points,
					"lines": shuttle.lines,
					"sensor": {
						"points": shuttleSensor.points,
						"lines": shuttleSensor.lines
					}
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
