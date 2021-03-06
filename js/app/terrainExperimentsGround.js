			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var GuiVarHolder = null;

			var container, stats, map_Container;
			var camera, scene, renderer;
			var mesh;
			var projector;
			var mouseVector;

			var text = [];
			var positionTransformVector;
			var noiseValues = [];
			var distortionFromImage = [];
			var normalsMap = [];

			var x,y;

			var terrainElements = [];

			var keyboardInteraction;
			var mainTerrrain;

			var simpleLine;
			var objectSelect = false;
			var selectedObject;
			var indexPoint = 0;

			//Mouse variables
			var lastX,lastY;
			var divX,divY;
			var wasClicked = false;
			var firstInteraction = false
			var cameraEnabled = false;
			var offset = new THREE.Vector3(0,0,1);
			//
			var noiseAttributes = {
				displacement: {
				    type: 'f', // a float
				    value: [] // an empty array
				},
				colors: { 
					type: "c", 
					value: [] }
			}
			var uniforms = {
				dis: {
				    type: 'f', // a float
				    value: 0 
			  },
			  	mainLight: {
			  		type: "v3",
			  		value: new THREE.Vector3( 0, 1, 1 )
			  },
			  	lightColorDiffuse: {
			  		type: "v3",
			  		value: new THREE.Vector3 (1, 1, 1)
			  	}
			};

			var sizeOfCamera;
			var clock = 0;
			init();
			animate();


			function init() {

				initPerm();
				container = document.getElementById( 'container' );
				container.style.position= 'relative';

				/*var ui_canvas = document.getElementById( 'ui_canvas' );
				
				ui_canvas.width = window.innerWidth*0.18;
				ui_canvas.height = window.innerHeight*0.5;

				map_Container = document.getElementById('map_Container');
				map_Container.style.position = 'relative';
				map_Container.style.right = (window.innerWidth*0.4) + "px"*/

				//map_Container.style.width = window.innerWidth*0.2;

				keyboardInteraction = new THREEx.KeyboardState();

				sizeOfCamera = 50;

				camera = new THREE.PerspectiveCamera( sizeOfCamera, window.innerWidth / window.innerHeight,0.1, 500 );
				camera.position.z = 100;
				camera.lookAt(new THREE.Vector3(0, 0, 0));

				scene = new THREE.Scene();
				//scene.fog = new THREE.Fog( 0xffffff, 0.2, 50000 );
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setClearColorHex( 0x5f5f5f, 1 );

				projector = new THREE.Projector();
				mouseVector = new THREE.Vector3();

				uniforms.mainLight.value = new THREE.Vector3(0.2,1,1);

				var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
				directionalLight.position.set( 0, 1, 0 ).normalize(); 

				scene.add( directionalLight );


				container.appendChild( renderer.domElement );

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );
				window.addEventListener( 'resize', onWindowResize, false );
				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );


			}



			$(function () 
			{
    			$(":file").change(function () 
    			{
        			if (this.files && this.files[0]) 
        			{
           	    		var reader = new FileReader();
            			reader.onload = imageIsLoaded;
            			reader.readAsDataURL(this.files[0]);
        			}
    			});
			});

			Caman.Filter.register("example", function (adjust) {

				  // Our process function that will be called for each pixel.
				  // Note that we pass the name of the filter as the first argument.
				  this.process("example", function (rgba) {
				  	var val = 0.21*rgba.r + 0.72*rgba.g  + 0.07*rgba.b;
				    rgba.r = 255- val;
				    rgba.g = 255- val;
				    rgba.b = 255- val;
				    distortionFromImage.push(val/255);

 					this.locationXY();

				    // Return the modified RGB values
				    return rgba;
				  });
				});




			function imageIsLoaded(e) 
			{
				 $('#myImg').attr('src', null);
				 $('#convertedImage').attr('src', null);
			    $('#myImg').attr('src', e.target.result);
			    $('#convertedImage').attr('src', e.target.result);
			   // var caman = Caman("#myImg");
			    
			    Caman("#myImg","#myImg", function () {

			    	this.resize({
					    width: GuiVarHolder.gridCount+1,
					    height:GuiVarHolder.gridCount+1
					  });
			    	this.render();

				});

			    while(distortionFromImage.length > 0) {
					distortionFromImage.pop();
				}

			    Caman("#convertedImage","#convertedImage", function () {

			    	this.resize({
					    width: GuiVarHolder.gridCount+1,
					    height:GuiVarHolder.gridCount+1
					  }).render();
			    	this.contrast(5);
			    	
			    	this.example();
			    	this.render();
			    	
				});
			    console.log(distortionFromImage.length);



			};

			function scaleSize(maxW, maxH, currW, currH){
			    var ratio = currH / currW;
			    if(currW >= maxW && ratio <= 1){
			        currW = maxW;
			        currH = currW * ratio;
			    } else if(currH >= maxH){
			        currH = maxH;
			        currW = currH / ratio;
			    }
			    return [currW, currH];
			}

			var FizzyText = function() {
			  this.message = 'dat.gui';
			  this.cameraEnabled = false;
			  this.rotationEnabled = true;
			  this.keyboardEnabled = false;
			  this.lightX = 0.02;
			  this.lightY = 0.02;
			  this.lightZ = 0.02;

			  this.lightCR = 1;
			  this.lightCG = 1;
			  this.lightCB = 1;
			  this.color3 = { h: 350, s: 0.9, v: 0.3 };

			  this.mainSize = 70;
			  this.gridCount = 3;

			  this.noiseParam1 = 0;
			  this.noiseParam2 = 0;

			  this.noiseParam3 = 45;

			  this.setColor = function()
			  {
			  	console.log("seting color on " + this.lightCR + " " + this.lightCG + " " + this.lightCB);
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(this.lightCR,this.lightCG,this.lightCB);
			  }

			  this.removePlane = function()
			  {
			  	if(terrainElements[terrainElements.length - 1] != null)
			  		scene.remove(terrainElements[terrainElements.length - 1]);
			  }
			  this.createPlane = function()
			  {
			  	this.removePlane();

			  	createPlane(new THREE.Vector3(0,-15,0),this.mainSize,0xffffff,(this.gridCount%2 == 1)?this.gridCount - 1:this.gridCount,true);
			  }
			  this.createPlaneFromImage = function()
			  {
			  	this.removePlane();

			  	createPlane(new THREE.Vector3(0,-15,0),this.mainSize,0xffffff,this.gridCount,false);
			  }
			  
			};

			window.onload = function() {
			  GuiVarHolder = new FizzyText();
			  var gui = new dat.GUI();

			  var f1 = gui.addFolder('ControlsEnabled');

			  f1.add(GuiVarHolder, 'cameraEnabled');
			  f1.add(GuiVarHolder, 'rotationEnabled');
			  f1.add(GuiVarHolder, 'keyboardEnabled');

			  var f2 = gui.addFolder('MainLight');

			  f2.add(GuiVarHolder, 'lightX',0,0.06);
			  f2.add(GuiVarHolder, 'lightY',0,0.06);
			  f2.add(GuiVarHolder, 'lightZ',0,0.06);

			  var f3 = gui.addFolder('MainLight Color');
			  var f31 = f3.addFolder('Diffuse');
			  var colorControler1 = f31.add(GuiVarHolder, 'lightCR',0,1);
			  var colorControler2 = f31.add(GuiVarHolder, 'lightCG',0,1);
			  var colorControler3 = f31.add(GuiVarHolder, 'lightCB',0,1);

			  colorControler1.onChange(function(value) {
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(value,GuiVarHolder.lightCG,GuiVarHolder.lightCB);
			  });
			  colorControler2.onChange(function(value) {
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(GuiVarHolder.lightCR,value,GuiVarHolder.lightCB);
			  });
			  colorControler3.onChange(function(value) {
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(GuiVarHolder.lightCR,GuiVarHolder.lightCG,value);
			  });
			 // f3.add(GuiVarHolder, 'color3');
			  f3.add(GuiVarHolder, 'setColor');

			  var f4 = gui.addFolder('TerrainOperations');
			  	var f5 = f4.addFolder('CreatedPlaneOptions');

			  	f5.add(GuiVarHolder, 'mainSize',2,1000);
			  	f5.add(GuiVarHolder, 'gridCount',2,300);

			  	f5.add(GuiVarHolder, 'noiseParam1',-1,10);
			  	f5.add(GuiVarHolder, 'noiseParam2',0,1);
			  	f5.add(GuiVarHolder, 'noiseParam3',-10,100);

			  f4.add(GuiVarHolder, 'removePlane');
			  f4.add(GuiVarHolder, 'createPlane');
			  f4.add(GuiVarHolder, 'createPlaneFromImage');

			 //gui.add(text, 'explode');
			};


			function createText(sizeX,sizeY,posX,posY)
			{
				var text2 = document.createElement('div');
				text2.style.position = 'absolute';
				text2.style.width = sizeX;
				text2.style.height = sizeY;
				text2.innerHTML = "hi there!";
				text2.style.top = posX + 'px';
				text2.style.left = posY + 'px';
				document.body.appendChild(text2);

				text.push(text2);
			}
			function purgeArrays()
			{
				while(normalsMap.length > 0) {
					normalsMap.pop();
				}
				while(noiseValues.length > 0) {
					noiseValues.pop();
				}

			}
			function createPlane(vecPos,size,col,sizeOfSub,usePerlin)
			{
				purgeArrays();

				var mainGeometry = new THREE.PlaneGeometry( size, size, parseInt(sizeOfSub),parseInt(sizeOfSub));
			
				var color, point, face, numberOfSides, vertexIndex;
				mainGeometry.computeBoundingBox();


				var faceIndices = [ 'a', 'b', 'c', 'd' ];
				var NoiseObject = PerlinSimplex;
				NoiseObject.noiseDetail(GuiVarHolder.noiseParam1,GuiVarHolder.noiseParam2);
				var values = noiseAttributes.displacement.value;
				var valuesColors = noiseAttributes.colors.value;

				for ( var i = 0; i < mainGeometry.vertices.length; i++ ) 
				{
				    point = mainGeometry.vertices[ i ];
				   if(usePerlin)
						var valueNoise = NoiseObject.noise((point.x + offset.x)/size,(point.y + offset.y)/size ,0,0);
					else 
						var valueNoise =  distortionFromImage[i];

				    color = new THREE.Color( 0xffffff );  
				    color.setRGB( valueNoise, valueNoise, valueNoise );
					mainGeometry.vertices[ i ] = new THREE.Vector3(point.x,point.y,point.z + valueNoise*GuiVarHolder.noiseParam3);

				    noiseValues.push(valueNoise);
				    values.push(valueNoise);
				    valuesColors.push(color);


				    normalsMap.push(null);
				}
				offset.x += point.x;
				offset.y += point.y;

				var basicDisplacmentMat = getMaterialDis();

				for ( var i = 0; i < mainGeometry.faces.length; i++ ) 
				{
				    face = mainGeometry.faces[ i ];

				    var normalVec = calculateNormals(
				    	mainGeometry.vertices[face.a], 
				    	mainGeometry.vertices[face.b], 
				    	mainGeometry.vertices[face.c]);	

				    checkAndAdd(face.a, normalVec);
				    checkAndAdd(face.b, normalVec);
				    checkAndAdd(face.c, normalVec);
				}

				for ( var i = 0; i < mainGeometry.faces.length; i++ ) 
				{
				    face = mainGeometry.faces[ i ];

				    face.vertexNormals[0] = normalsMap[face.a].normalize();
				    face.vertexNormals[1] = normalsMap[face.b].normalize();
				    face.vertexNormals[2] = normalsMap[face.c].normalize();

				}



				mainTerrrain = new THREE.Mesh(mainGeometry, basicDisplacmentMat);
				mainTerrrain.position = vecPos; 
				mainTerrrain.geometry.materialsNeedUpdate = true;

				scene.add( mainTerrrain );

				terrainElements.push(mainTerrrain);	
			}	
			

			function checkAndAdd(i , vector)
			{
					if( normalsMap[i] == null)
				    	normalsMap[i] = vector;
					else
					{
						normalsMap[i].value+=vector;
					}
			}


			function getMaterialDis()
			{
				var mat =  new THREE.ShaderMaterial({
					attributes: noiseAttributes,
					uniforms:       uniforms,
				    vertexShader: document.getElementById('vertexshader').innerHTML,
				    fragmentShader: document.getElementById('fragmentshader').innerHTML,
				   // mat.shading = THREE.
				});
				//mat.wireframe = true;
				//mat.lights = true;
				//mat.shading = THREE.FlatShading;
				return mat;
			}
			function getMaterialLamb()
			{
				var mat =  new THREE.MeshPhongMaterial({
        		color: 'white' 
      			});
				return mat;
			}

			function onDocumentMouseDown(event)
		    {
				event.preventDefault();
				wasClicked = true;
				firstInteraction = true;
				lastY = event.clientY;
				lastX = event.clientX;
				
			}
			function onDocumentMouseMove(event)
			{
				event.preventDefault();

					divX = event.clientX - lastX;
					divY = event.clientY - lastY;

				if(wasClicked && GuiVarHolder.rotationEnabled)
				{	
					if(terrainElements[terrainElements.length-1] != null)
					{
						terrainElements[terrainElements.length-1].rotation.x+=divY/sizeOfCamera;
						terrainElements[terrainElements.length-1].rotation.y+=divX/sizeOfCamera;
					}
	
				}
				else if(firstInteraction)
				{
					setCameraRotation(divX,divY);
				}
				lastY = event.clientY;
				lastX = event.clientX;


			}

			function setCameraRotation(divx,divY)
			{
				if(!GuiVarHolder.cameraEnabled)
					return;

				camera.rotation.y-= 0.1*divX/sizeOfCamera;
				camera.rotation.x-= 0.1*divY/sizeOfCamera;

				var x = Math.sin((camera.rotation.x*Math.PI)/180.0);
				var y = Math.sin((camera.rotation.y*Math.PI)/180.0);
				var z = Math.sin((camera.rotation.z*Math.PI)/180.0);
				var mulFactor =  1.0/(x + y + z);


				positionTransformVector = new THREE.Vector3(x*mulFactor,y*mulFactor,z*mulFactor);
				positionTransformVector.normalize();
			}
			function keyboardInfo()
			{
				if(GuiVarHolder!=null &&!GuiVarHolder.keyboardEnabled)
					return;
				if(keyboardInteraction.pressed("w"))
				{	
					camera.position.z -= positionTransformVector.x;
				}
				if(keyboardInteraction.pressed("s"))
				{
					camera.position.x -= 1;
				}
				if(keyboardInteraction.pressed("a"))
				{
					camera.position.z += 1;
				}
				if(keyboardInteraction.pressed("d"))
				{
					camera.position.z -= 1;
				}
			}

			function onDocumentMouseUp(event)
			{
				event.preventDefault();
				wasClicked = false;
			}
			
			function onWindowResize() 
			{
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;


				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function animate()
			{
				requestAnimationFrame( animate );
				if(GuiVarHolder != null)
				{
				uniforms.mainLight.value = new THREE.Vector3(Math.cos(clock*GuiVarHolder.lightX),Math.sin(clock*GuiVarHolder.lightY),Math.cos(clock*GuiVarHolder.lightZ));
				}
				else
				{
					uniforms.mainLight.value = new THREE.Vector3(1,1,1);
				}

				stats.update();
				render();
			}
			function render()
		    {
				renderer.render( scene, camera );
				keyboardInfo();
				clock+=1;
			}

			function calculateNormals( a, b, c)
			{
				var ab = new THREE.Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
				var ac = new THREE.Vector3(c.x - a.x, c.y - a.y, c.z - a.z);

				var i = ab.y*ac.z - ab.z*ac.y;
				var j = ab.x*ac.z - ab.z*ac.x;
				var k = ab.x*ac.y - ab.y*ac.x;

				return new THREE.Vector3(i,j,k);
			}
