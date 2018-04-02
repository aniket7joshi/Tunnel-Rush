var buffersObstacle = [];
var ObstacleFlag = [];
var ObstacleRotationFlag = [];
var rotateDirection = [];
var rotateObstacle = [];
var score = 0;
var previousScore = 0;
var level = 1;
var time = 0;
var normal = 1;
var jump = 0;
var height = 0;
var collided = -1;
var avoided = 0;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
function music()
{
	document.getElementById('crash').play();
}
main();
//
// Start here
function main() {
	const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	document.getElementById('music').play();
	//console.log("above");
	// If we don't have a GL context, give up now

  	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
  	}

  	// Vertex shader program

  	const vsSource = `
    	attribute vec4 aVertexPosition;
    	attribute vec3 aVertexNormal;
    	attribute vec2 aTextureCoord;
    	uniform mat4 uNormalMatrix;
    	uniform mat4 uModelViewMatrix;
    	uniform mat4 uProjectionMatrix;
    	varying highp vec2 vTextureCoord;
    	varying highp vec3 vLighting;
    	void main(void) 
    	{
      		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      		vTextureCoord = aTextureCoord;
      		// Apply lighting effect
			highp vec3 ambientLight = vec3(0.9, 0.9, 0.9);
      		highp vec3 directionalLightColor = vec3(0.53, 0.53, 0.53);
      		highp vec3 directionalVector = normalize(vec3(0.85,0, 0.75));
      		highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      		highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      		vLighting = ambientLight + (directionalLightColor * directional);
    	}
  	`;

  	const vsSource2 = `
    	attribute vec4 aVertexPosition;
    	attribute vec3 aVertexNormal;
    	attribute vec2 aTextureCoord;
    	uniform mat4 uNormalMatrix;
    	uniform mat4 uModelViewMatrix;
    	uniform mat4 uProjectionMatrix;
    	varying highp vec2 vTextureCoord;
    	varying highp vec3 vLighting;
    	void main(void) 
    	{
      		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      		vTextureCoord = aTextureCoord;
      		// Apply lighting effect
			highp vec3 ambientLight = vec3(0.2, 0.2, 0.2);
      		highp vec3 directionalLightColor = vec3(0.62,0.62, 0.62);
      		highp vec3 directionalVector = normalize(vec3(0,0,0));
      		highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      		highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      		vLighting = ambientLight + (directionalLightColor * directional);
    	}
  	`;

  // Fragment shader program

  	const fsSource = `
    	varying highp vec2 vTextureCoord;
    	varying highp vec3 vLighting;
    	uniform sampler2D uSampler;
    	void main(void) {
      		highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      		gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    	}
  	`;

  	const fsSource1 = `
    	varying highp vec2 vTextureCoord;
    	varying highp vec3 vLighting;
    	uniform sampler2D uSampler;
    	void main(void) {
      		highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      		gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    		gl_FragColor.r+=0.2;
    		gl_FragColor.g+=0.2;
    		gl_FragColor.b+=0.2;

    	}
  	`;

  	// Initialize a shader program; this is where all the lighting
  	// for the vertices and so forth is established.
  	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  	const shaderProgram1 = initShaderProgram(gl, vsSource, fsSource1);
  	const shaderProgram2 = initShaderProgram(gl, vsSource2, fsSource);



  	// Collect all the info needed to use the shader program.
  	// Look up which attributes our shader program is using
  	// for aVertexPosition, aVevrtexColor and also
  	// look up uniform locations.
  	const programInfo = {
    	program: shaderProgram,
    	attribLocations: {
      		vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      		vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      		textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    	},
    	uniformLocations: {
      		projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      		modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      		normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      		uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    	},
	};

	const programInfo1 = {
    	program: shaderProgram1,
    	attribLocations: {
      		vertexPosition: gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
      		vertexNormal: gl.getAttribLocation(shaderProgram1, 'aVertexNormal'),
      		textureCoord: gl.getAttribLocation(shaderProgram1, 'aTextureCoord'),
    	},
    	uniformLocations: {
      		projectionMatrix: gl.getUniformLocation(shaderProgram1, 'uProjectionMatrix'),
      		modelViewMatrix: gl.getUniformLocation(shaderProgram1, 'uModelViewMatrix'),
      		normalMatrix: gl.getUniformLocation(shaderProgram1, 'uNormalMatrix'),
      		uSampler: gl.getUniformLocation(shaderProgram1, 'uSampler'),
    	},
	};

	const programInfo2 = {
    	program: shaderProgram2,
    	attribLocations: {
      		vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      		vertexNormal: gl.getAttribLocation(shaderProgram2, 'aVertexNormal'),
      		textureCoord: gl.getAttribLocation(shaderProgram2, 'aTextureCoord'),
    	},
    	uniformLocations: {
      		projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      		modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
      		normalMatrix: gl.getUniformLocation(shaderProgram2, 'uNormalMatrix'),
      		uSampler: gl.getUniformLocation(shaderProgram2, 'uSampler'),
    	},
	};

  	// Here's where we call the routine that builds all the
  	// objects we'll be drawing.
  	const buffersTunnel = initBuffersTunnel(gl);
  	for(var i = 0;i<200;i++)
  	{
  		var flag = getRandomInt(0,3);
  		ObstacleFlag.push(flag);
  		flag = getRandomInt(0,1);
  		ObstacleRotationFlag.push(flag);
  		rotateDirection.push(flag);
  		rotateObstacle.push(0);
  		buffersObstacle.push(initBuffersObstacle(gl,ObstacleFlag[i]));
	}
	const texture = loadTexture(gl, 'b.jpg');
	const obstexture = loadTexture(gl, 'c.jpeg');
	console.log(texture);
  	var then = 0;

  	// Draw the scene repeatedly
	Mousetrap.bind('a',function(){ 
		tunnelRotation+=0.07 + level*0.001;
		//console.log('inside main' + tunnelRotation);
	});
	Mousetrap.bind('d',function() { tunnelRotation-=0.07 + level*0.001; });
	Mousetrap.bind('1',function() { normal = 0;});
	Mousetrap.bind('2',function() { normal = 1;});
	Mousetrap.bind('space',function() { 
		if(jump == 0)
		jump = 1;
	});
  	
  	function render(now) 
  	{
  		if(score<0)
  			score = 0;
  		document.getElementById('score').innerHTML = score;
  		document.getElementById('level').innerHTML = level;
		document.getElementById('collide').innerHTML = collided;
  		document.getElementById('avoid').innerHTML = avoided;
  		document.getElementById('speed').innerHTML = 100 + (level-1)*10 + ' km/hr';
  		if(collided>=3)
  		{
  			alert('Game Over' + '\n' + 'Your final Score is ' + score);
  			document.location.reload();
  		}

  		time++;
  		if(score > previousScore + 100)
  		{
  			level = level + 1;
  			previousScore = score;
  		}
  		if(jump == 1)
  		{
  			height = height + 0.03;
  			console.log(height);
  			if(height>0.4)
  			{
  				jump = -1;
  			}
  		}
  		else if(jump == -1)
  		{
  			height = height - 0.03;
  			if(height<0)
  			{
  				height = 0;
  				jump = 0;
  			}
  		}
		//console.log("haha");
		now *= 0.001;  // convert to seconds
		const deltaTime = now - then;

		then = now;
		if(normal == 0)
		{
			drawSceneTunnel(gl, programInfo2, buffersTunnel, texture, deltaTime);
		}
		else
		{
			if(time%500<475)
				drawSceneTunnel(gl, programInfo, buffersTunnel, texture, deltaTime);
			else
				drawSceneTunnel(gl, programInfo1, buffersTunnel, texture, deltaTime);
		}
		forwardObstacle +=0.15 + level*0.01;
		for(var i = 0;i<200;i++)
		{
			if(rotateDirection[i] == 0 && i%4 == 0)
			{
				rotateObstacle[i]+=0.01 + level*0.001;
			}
			else if(rotateDirection[i] == 0 && i%4==1)
			{
				rotateObstacle[i]+=0.02 + level*0.001;
			}
			else if(rotateDirection[i] == 0 && i%4 == 2)
			{
				rotateObstacle[i]+=0.03 + level*0.001;
			}
			else if(rotateDirection[i] == 0 && i%4 == 3)
			{
				rotateObstacle[i]+=0.04 + level*0.001;
			}
			else if(rotateDirection[i] == 1 && i%4 == 0)
			{
				rotateObstacle[i]-=0.01 + level*0.001;
			}
			else if(rotateDirection[i] == 1 && i%4==1)
			{
				rotateObstacle[i]-=0.02 + level*0.001;
			}
			else if(rotateDirection[i] == 1 && i%4 == 2)
			{
				rotateObstacle[i]-=0.03 + level*0.001;
			}
			else if(rotateDirection[i] == 1 && i%4 == 3)
			{
				rotateObstacle[i]-=0.04 + level*0.001;
			}
			
		}
		for(var i = 0;i<200;i++)
		{
			var dist = 20 - level*0.5;
			drawSceneObstacle(gl, programInfo, buffersObstacle[i], deltaTime, ObstacleFlag[i], i, ObstacleRotationFlag[i], obstexture, dist);
			if(((-dist*i) + forwardObstacle) > 0.05 && ((-dist*i) + forwardObstacle)<0.2)
			{
				var alive = 1;
				if((ObstacleFlag[i] == '1') && ObstacleRotationFlag[i] == '0')   //Collision with the rectangle object
				{
					var x = tunnelRotation*180/Math.PI;
					while(x<0)
						x = x+360;
					if(((x)%360>65 && (x)%360<110) || ((x)%360>245 && (x)%360<290))
					{
						console.log("passed");
						console.log(x);
						score = score + 10;
						avoided++;
						continue;
					}
					else 
					{
						console.log((x));
						console.log('dead');
						score = score - 5;
						collided++;
						sleep(1000);
					}
				}
				else if((ObstacleFlag[i] == '1') && ObstacleRotationFlag[i] == '1')   //Collision with the rectangle object having rotation
				{
					var y = (rotateObstacle[i] + tunnelRotation)*180/Math.PI;
					while(y<0)
						y = y+360;
					if(((y)%360>65 && (y)%360<110) || ((y)%360>245 && (y)%360<290))
					{
						console.log("passed");
						console.log(y%360);
						score = score + 20;
						avoided++;
						
						continue;
					}
					else 
					{
						console.log((y%360));
						console.log('dead');
						//music();
						score = score - 5;
						collided++;
						sleep(1000);

					}
				}
				if((ObstacleFlag[i] == '3') && ObstacleRotationFlag[i] == '0')   //Collision with the rectangle object
				{
					var x = tunnelRotation*180/Math.PI;
					while(x<0)
						x = x+360;
					if(((x)%360>40 && (x)%360<135) || ((x)%360>220 && (x)%360<315))
					{
						console.log("passed");
						console.log(x);
						score = score + 5;
						avoided++;
						continue;
					}
					else 
					{
						console.log((x));
						console.log('dead');
						score = score - 5;
						collided++;
						sleep(1000);
					}
				}
				else if((ObstacleFlag[i] == '3') && ObstacleRotationFlag[i] == '1')   //Collision with the rectangle object having rotation
				{
					var y = (rotateObstacle[i] + tunnelRotation)*180/Math.PI;
					while(y<0)
						y = y+360;
					if(((y)%360>40 && (y)%360<135) || ((y)%360>220 && (y)%360<315))
					{
						console.log("passed");
						console.log(y%360);
						score = score + 10;
						avoided++;
						continue;
					}
					else 
					{
						console.log((y%360));
						console.log('dead');
						//music();
						score = score - 5;

						collided++;
						sleep(1000);

					}
				}
				else if(ObstacleFlag[i] == '0' && ObstacleRotationFlag[i] == '0')
				{
					var x = tunnelRotation*180/Math.PI;
					while(x<0)
						x = x+360;
					if(((x)%360>=0 && (x)%360<=20) || ((x)%360>=155 && (x)%360<205) || ((x)%360>=340 && (x)%360<=360))
					{
						console.log("passed");
						console.log(x);
						score = score + 15; 
						avoided++;
						continue;
					}
					else 
					{
						console.log((x));
						console.log('dead');
						//music();
						score = score - 5;

						collided++;
						sleep(1000);

					}
				}
				else if(ObstacleFlag[i] == '0' && ObstacleRotationFlag[i] == '1')   //Collision with the rectangle object having rotation
				{
					var y = (rotateObstacle[i] + tunnelRotation)*180/Math.PI;
					while(y<0)
						y = y+360;
					if(((y)%360>=0 && (y)%360<=20) || ((y)%360>=150 && (y)%360<210) || ((y)%360>=340 && (y)%360<=360))
					{
						console.log("passed");
						console.log(y);
						score = score + 25;
						avoided++;
						continue;
					}
					else 
					{
						console.log((y));
						console.log('dead');
						//music();
						score = score - 5;

						collided++;
						sleep(1000);

					}
				}
				else if(ObstacleFlag[i] == '2' && ObstacleRotationFlag[i] == '0')   //Collision with Semi Circle
				{
					var y = (tunnelRotation)*180/Math.PI;
					while(y<0)
						y = y+360;
					if(((y)%360>=20 && (y)%360<=160))
					{
						console.log("passed");
						console.log(y%360);
						score = score + 20;
						avoided++;
						continue;
					}
					else 
					{
						console.log((y%360));
						console.log('dead');
						//music();
						score = score - 5;

						collided++;
						sleep(1000);

					}
				}
				else if(ObstacleFlag[i] == '2' && ObstacleRotationFlag[i] == '1')   
				{
					var y = (rotateObstacle[i] + tunnelRotation)*180/Math.PI;
					while(y<0)
						y = y+360;
					if(((y)%360>=20 && (y)%360<=160))
					{
						console.log("passed");
						console.log(y%360);
						score = score + 30;
						avoided++;
						continue;
					}
					else 
					{
						console.log((y%360));
						console.log('dead');
						//music();
						score = score - 5;

						collided++;
						sleep(1000);

					}
				}
			}
			else
			{
				continue;
			}
		}
						

		//checkCollision();
		requestAnimationFrame(render);
  	}
  	requestAnimationFrame(render);
}

