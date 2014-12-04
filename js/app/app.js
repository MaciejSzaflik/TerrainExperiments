define( ["three", "camera", "controls", 
"geometry", "light", "material", "renderer", 
"scene","dat","PerlinSimplex",
"shader!ver.vert", "shader!ver.frag","Caman","KeyboardState"],
function ( THREE, camera, controls, geometry, 
light, material, renderer, scene ,verVert, verFrag,simpleVert, simpleFrag) {
  var app = {
  
			GuiVarHolder : null,
			imageFildersVar : null,
			
			
			camera,
			scene, 
			renderer,

			text : [],
			positionTransformVector : new THREE.Vector3(0,0,0),
			noiseValues : [],
			distortionFromImage : [],
			normalsMap : [],
			markerObjects : [],
			markerMesh : [],
			markerIterator : 0,
			halfOfTheSizeOfPlane : 0,
			sizeOfPlane : 0,
			mouseVector : new THREE.Vector3(0,0,0),
			projector : null,

			x : 0,
			y : 0,

			terrainElements : [],
			createdPlanePosition : new THREE.Vector3(0,0,0),
			stepSizeX : 0,
			stepSizeY : 0,
			keyboardInteraction : null,
			mainTerrrain : null,
			dOfPlane : 0,
			loopTime : new Date(),
			currentTransformsArray : [],

			objectSelect : false,
			selectedObject : null,
			indexPoint : 0,

			//Mouse variables
			lastX : 0,
			lastY : 0,
			divX : 0,
			divY : 0,
			angleX : 0,
			angleY : -Math.PI*0.1,
			currentForward : new THREE.Vector3(1,0,0),
			currentUp : new THREE.Vector3(0,0,1),
			mainForward : new THREE.Vector3(1,0,0),
			wasClicked : false,
			firstInteraction : false,
			cameraEnabled : false,
			isLocked : false,
			offset : new THREE.Vector3(0,0,1),
			//
			noiseAttributes : {
				displacement: {
				    type: 'f', // a float
				    value: [] // an empty array
				},
				colors: { 
					type: "c", 
					value: [] }
			},
			uniforms : {
				dis: {
				    type: 'f', // a float
				    value: 1
			  },
			  	mainLight: {
			  		type: "v3",
			  		value: new THREE.Vector3( 0, 1, 1 )
			  },
			  	lightColorDiffuse: {
			  		type: "v3",
			  		value: new THREE.Vector3 (1, 1, 1)
			  	},
				ambient: {
			  		type: "v3",
			  		value: new THREE.Vector3 (0.2, 0.2, 0.2)
			  	},
				texture: { type: "t", value: THREE.ImageUtils.loadTexture('js/textures/ground.jpg') }
			},

		    clock : 0,
			
			
			
			 FizzyText :function(){
			  this.message = 'dat.gui';
			  this.cameraEnabled = false;
			  this.rotationEnabled = true;
			  this.keyboardEnabled = true;
			  this.lightX = 0.02;
			  this.lightY = 0.02;
			  this.lightZ = 0.02;

			  this.lightCR = 1;
			  this.lightCG = 1;
			  this.lightCB = 1;
			  this.color3 = { h: 350, s: 0.9, v: 0.3 };

			  this.mainSize = 70;
			  this.gridCount = 60;
			  this.tile = 3;

			  this.noiseParam1 = 6;
			  this.noiseParam2 = 0.5;

			  this.noiseParam3 = 45;
			  
			  this.lookAtX = 0;
			  this.lookAtY = 0;
			  this.lookAtZ = 1;
			  
			  this.rotationX = 90;

			  this.setColor = function()
			  {
			  	this.uniforms.lightColorDiffuse.value = new THREE.Vector3(this.lightCR,this.lightCG,this.lightCB);
			  }

			  this.removePlane = function()
			  {
			  	if(app.terrainElements[app.terrainElements.length - 1] != null)
			  		scene.remove(app.terrainElements[app.terrainElements.length - 1]);
			  }
			  this.createPlane = function()
			  {
			  	this.removePlane();

			  	app.createPlane(new THREE.Vector3(0,0,0),this.mainSize,0xffffff,(this.gridCount%2 == 1)?this.gridCount - 1:this.gridCount,true);
			  }
			  this.createPlaneFromImage = function()
			  {
			  	this.removePlane();

			  	app.createPlane(new THREE.Vector3(0,0,0),this.mainSize,0xffffff,this.gridCount,false);
			  }
			  this.tryToLock = function()
			  {		  
				app.tryToInitPointLock();
			  }
			  
			  
			},
			
			  ImageControls :function(){
			  this.message = 'dat.gui';
			  this.invert = false;
			  this.brightness = 0;
			  this.contrast = 0;
			  this.exposure = 0;
			  this.gamma = 1;
			  this.stackBlur = 0;
			  this.vertIndex = 0;
			  this.markIndex = 0;
			  this.numberOfObjectForTest = 20;
			  this.timeOfTransform = 3;
			  
			  this.AddMarker = function()
			  {
			    var pos = app.createSphere(this.vertIndex,-30,1);
				app.raycastTerrain(pos);	
			  }
			  this.MoveTransformProt = function(){
				this.object;
				this.startPosition;
				this.endPosition;
				this.time =0;
				this.currentStep = 0;
				this.end = false;
				this.curX;
				this.curZ;
				this.id;
				this.onTransformationFinish;
				this.setEndPoint = function()
				{
					this.startPosition = this.object.position;
					this.curX = this.endPosition.x - this.object.position.x;
					this.curZ = this.endPosition.z - this.object.position.z;
					this.time = 1/this.time;
					
				}
				this.doTransform = function(fp){	
					this.currentStep+= this.time/fp;
						if(!this.end && this.currentStep <= 1.001)
						{
							var posX = this.startPosition.x + this.currentStep*this.curX;
							var posZ = this.startPosition.z + this.currentStep*this.curZ;
							var posY = app.getHeightPoint(new THREE.Vector3(posX,0,posZ));
							this.object.position = new THREE.Vector3(
								posX,
								posY.y + 1,
								posZ);
						}
						else
						{
							this.onTransformationFinish();
							this.end = true;
						}
					}
				},
			  
			  this.MoveTo = function()
			  {
				var pos = app.terrainElements[0].geometry.vertices[this.vertIndex];
				var transform = new this.MoveTransformProt();
				transform.endPosition = pos;
				transform.time = this.timeOfTransform;
				transform.object = app.markerMesh[this.markIndex];
				transform.id = this.markIndex;
				transform.setEndPoint();
				transform.onTransformationFinish = function()
				{
					console.log("transFromEnd2");
				}

				app.currentTransformsArray.push(transform);
			  }
			  this.RandomizedMovement = function(indexVal)
			  {
					var pos = app.terrainElements[0].geometry.vertices[app.randomIntFromInterval(0,app.terrainElements[0].geometry.vertices.length)];
					var transform = new this.MoveTransformProt();
					transform.endPosition = pos;		
					if(indexVal == null)
						indexVal = this.markIndex;
					transform.object = app.markerMesh[indexVal];				
					var dist = transform.object.position.distanceTo(pos);
					transform.time = dist/10;
					transform.id = indexVal;
					transform.setEndPoint();
					transform.onTransformationFinish = function()
					{
						app.imageFildersVar.RandomizedMovement(transform.id);
					}
					app.currentTransformsArray.push(transform);		
			  }
			  this.TestMovement = function()
			  {
				for(var i =0; i<this.numberOfObjectForTest;i++)
				{
					app.createSphere(0,-30,1);
					this.RandomizedMovement(i);
				}			
			  }
			   
			},
			randomIntFromInterval : function(min,max)
			{
				return Math.floor(Math.random()*(max-min+1)+min);
			},

	
	initializeGUI : function(){
	
	 this.imageFildersVar = new this.ImageControls();
			var guiImg = new dat.GUI();
			
			var fol1 =  guiImg.addFolder('BasicFilters');
			  fol1.add(this.imageFildersVar,'invert');
			  fol1.add(this.imageFildersVar, 'stackBlur',0,20);
			  fol1.add(this.imageFildersVar, 'contrast',-100,100);
			  fol1.add(this.imageFildersVar, 'exposure',-100,100);
			  fol1.add(this.imageFildersVar, 'gamma',-5,20);
			  fol1.add(this.imageFildersVar, 'brightness',-100,100);
			
			var fol2 = guiImg.addFolder('Marker');
			  fol2.add(this.imageFildersVar,'vertIndex');
			  fol2.add(this.imageFildersVar,'markIndex');
			  fol2.add(this.imageFildersVar,'AddMarker');
			  fol2.add(this.imageFildersVar,'MoveTo');
			  fol2.add(this.imageFildersVar,'RandomizedMovement');
			  fol2.add(this.imageFildersVar,'TestMovement');
			  fol2.add(this.imageFildersVar,'numberOfObjectForTest');
			  fol2.add(this.imageFildersVar,'timeOfTransform');
			  
	 this.GuiVarHolder = new this.FizzyText();
			  var gui = new dat.GUI();  

			  var f2 = gui.addFolder('MainLight');

			  f2.add(this.GuiVarHolder, 'lightX',0,0.06);
			  f2.add(this.GuiVarHolder, 'lightY',0,0.06);
			  f2.add(this.GuiVarHolder, 'lightZ',0,0.06);

			  var f3 = gui.addFolder('MainLight Color');
			  var f31 = f3.addFolder('Diffuse');
			  var colorControler1 = f31.add(this.GuiVarHolder, 'lightCR',0,1);
			  var colorControler2 = f31.add(this.GuiVarHolder, 'lightCG',0,1);
			  var colorControler3 = f31.add(this.GuiVarHolder, 'lightCB',0,1);

    		  colorControler1.onChange(function(value) {
			  	app.uniforms.lightColorDiffuse.value = new THREE.Vector3(app.GuiVarHolder.lightCG,app.GuiVarHolder.lightCB);
			  });
			  colorControler2.onChange(function(value) {
			  	app.uniforms.lightColorDiffuse.value = new THREE.Vector3(app.GuiVarHolder.lightCR,value,app.GuiVarHolder.lightCB);
			  });
			  colorControler3.onChange(function(value) {
			  	app.uniforms.lightColorDiffuse.value = new THREE.Vector3(app.GuiVarHolder.lightCR,app.GuiVarHolder.lightCG,value);
			  });
			 // f3.add(GuiVarHolder, 'color3');
			  f3.add(this.GuiVarHolder, 'setColor');

			  var f4 = gui.addFolder('TerrainOperations');
			  	var f5 = f4.addFolder('CreatedPlaneOptions');

			  	f5.add(this.GuiVarHolder, 'mainSize',2,1000);
			  	f5.add(this.GuiVarHolder, 'gridCount',2,500);

			  	f5.add(this.GuiVarHolder, 'noiseParam1',-1,10);
			  	f5.add(this.GuiVarHolder, 'noiseParam2',0,1);
			  	f5.add(this.GuiVarHolder, 'noiseParam3',-10,100);
				f5.add(this.GuiVarHolder, 'rotationX',0,360);

			  f4.add(this.GuiVarHolder, 'removePlane');
			  f4.add(this.GuiVarHolder, 'createPlane');
			  f4.add(this.GuiVarHolder, 'createPlaneFromImage');

			 gui.add(this.GuiVarHolder, 'tryToLock');
			
			},
	
	getFile : function (){
        
    },
	
    init: function () {
     this.initializeGUI();
	 this.setUpCubeMap();
	 
	 this.keyboardInteraction = new THREEx.KeyboardState();
	 				
	this.createText(10,10,10,10);
	this.createText(10,10,20,10);
	this.createText(10,10,30,10);
	this.createText(10,10,40,10);
	this.createText(10,10,50,10);
	this.createText(10,10,60,10);
	this.text[1].innerHTML = this.cameraLookDir(camera).x + " " + this.cameraLookDir(camera).y + " "+ this.cameraLookDir(camera).z ;
	this.text[2].innerHTML = camera.up.x + " " + camera.up.y  + " "+ camera.up.z;
	this.text[3].innerHTML = "";
	this.text[4].innerHTML = "fps: ";
	/*app.stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );*/
	//document.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
	//document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
    //document.addEventListener( 'mouseup', this.onDocumentMouseUp, false );
	
	document.addEventListener('pointerlockchange', this.changeCallback, false);
	document.addEventListener('mozpointerlockchange', this.changeCallback, false);
	document.addEventListener('webkitpointerlockchange', this.changeCallback, false);

	document.addEventListener("mousemove", this.moveCallback, false);
	//document.addEventListener('mousedown', this.selectCall, false );
	//document.addEventListener('mouseup', this.selectCall, false );
	document.getElementById('threejs-container').addEventListener("click", this.selectCall);
	
	projector = new THREE.Projector();
    

	document.getElementById("fileBtn").addEventListener('change',
		function () 
		{
			if (this.files && this.files[0]) 
				{
					var reader = new FileReader();
					reader.onload = app.imageIsLoaded;
					reader.readAsDataURL(this.files[0]);
				}
		});
		
	document.getElementById("textureBtn").addEventListener('change',
		function () 
		{
			if (this.files && this.files[0]) 
				{
					var reader = new FileReader();
					reader.onload = app.textureIsLoaded;
					reader.readAsDataURL(this.files[0]);
				}
		});

	Caman.Filter.register("example", function (adjust) {

				  // Our process function that will be called for each pixel.
				  // Note that we pass the name of the filter as the first argument.
				  this.process("example", function (rgba) {
				  	var val = 0.21*rgba.r + 0.72*rgba.g  + 0.07*rgba.b;
						
					if(app.imageFildersVar.invert) 
						val = 255- val;

					rgba.r = val;
					rgba.g = val;
					rgba.b = val;

					
				    app.distortionFromImage.push(val/255);

 					this.locationXY();

				    // Return the modified RGB values
				    return rgba;
				  });
				});
	
	},
	changeCallback : function()
	{
		
		app.isLocked = !app.isLocked;
		if(app.isLocked)
			app.text[0].innerHTML = "lock";
		else
			app.text[0].innerHTML = "unlock";
	},
	moveCallback : function(e)
	{
		if(app.isLocked)
		{

		var movementX = e.movementX ||
			  e.mozMovementX        ||
			  e.webkitMovementX     ||
			  0,
			movementY = e.movementY ||
			  e.mozMovementY        ||
			  e.webkitMovementY     ||
			  0;
		
		
		app.text[0].innerHTML = "move" + " " + movementX + "  " + movementY;
		app.calculateCameraRotation(movementX,movementY);
		}	
	},	
	selectCall : function(e)
	{
		app.rayCastMarkers(e);
	},
	calculateCameraRotation : function(movementX,movementY)
	{
		var x = movementX/app.renderer.domElement.width;
		var y = movementY/app.renderer.domElement.height;	
				
		app.angleX -= Math.atan(x)*1.0;
		app.angleY -= Math.atan(y)*1.0;
				
		var frontDirection = new THREE.Vector3(0,0,0)
		frontDirection.copy(app.cameraLookDir(camera));
		frontDirection.sub(camera.position);
		frontDirection.normalize();
		
		var quatX = new THREE.Quaternion();
		var quatY = new THREE.Quaternion();
		quatX.setFromAxisAngle( new THREE.Vector3(0,1,0), app.angleX);
		quatY.setFromAxisAngle( new THREE.Vector3(1,0,0), app.angleY);
		camera.quaternion.multiplyQuaternions(quatX,quatY);
		
	},	
	cameraLookDir: function(camera) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(camera.rotation, camera.rotation.order);
        return vector;
    },
	getStrafeDirection: function() {
		var strafeDirection = new THREE.Vector3();
		strafeDirection.crossVectors(forwardDirection,camera.up);
		return strafeDirection
	},
	keyboardInfo:function ()
	{
		
		if(app.GuiVarHolder!=null &&!app.GuiVarHolder.keyboardEnabled)
			return;
			
		var forwardDirection = this.cameraLookDir(camera);
		var strafeDirection = new THREE.Vector3();
		strafeDirection.crossVectors(forwardDirection,camera.up);
		this.text[1].innerHTML = strafeDirection.x + " " + strafeDirection.y  + " "+ strafeDirection.z;
		this.text[2].innerHTML = forwardDirection.x + " " + forwardDirection.y  + " "+ forwardDirection.z;
		
		var forwardScale = 0.0;
		forwardScale += this.keyboardInteraction.pressed("w") ? 1.0 : 0.0;
		forwardScale -= this.keyboardInteraction.pressed("s") ? 1.0 : 0.0;
		
		var strafeScale = 0.0;
		strafeScale += this.keyboardInteraction.pressed("d") ? 1.0 : 0.0;
		strafeScale -= this.keyboardInteraction.pressed("a") ? 1.0 : 0.0;
			 
		forwardDirection.multiplyScalar(forwardScale);
		strafeDirection.multiplyScalar(strafeScale);
		
		camera.position.add(forwardDirection);
		camera.position.add(strafeDirection);

		if(this.keyboardInteraction.pressed("e"))
			app.calculateCameraRotation(10,0);
		if(this.keyboardInteraction.pressed("q"))
			app.calculateCameraRotation(-10,0);
		if(this.keyboardInteraction.pressed("z"))
			app.calculateCameraRotation(0,10);
		if(this.keyboardInteraction.pressed("c"))
			app.calculateCameraRotation(0,-10);
		
	},	
	tryToInitPointLock :function()
	{
		var havePointerLock = 'pointerLockElement' in document ||
		'mozPointerLockElement' in document ||
		'webkitPointerLockElement' in document;
		
		if(havePointerLock)
		{
			var element = document.getElementById( 'threejs-container' );
			
			element.requestPointerLock = element.requestPointerLock ||
					 element.mozRequestPointerLock ||
					 element.webkitRequestPointerLock;
					 
			element.requestPointerLock();

			if(document.pointerLockElement === element ||
			  document.mozPointerLockElement === element ||
			  document.webkitPointerLockElement === element) {
				console.log('The pointer lock status is now locked');
			} else {
				console.log('The pointer lock status is now unlocked');  
			}
			
		}
	},
	setUpCubeMap :function()
	{			
				var urlPrefix = "js/textures/";
				var urls = [ urlPrefix + "posx.jpg", urlPrefix + "negx.jpg",
					urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",
					urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
				var textureCube = THREE.ImageUtils.loadTextureCube( urls );

				var cubeShader = THREE.ShaderLib['cube'];
				cubeShader.uniforms['tCube'].value = textureCube;

				var skyBoxMaterial = new THREE.ShaderMaterial( {
					fragmentShader: cubeShader.fragmentShader,
					vertexShader: cubeShader.vertexShader,
					uniforms: cubeShader.uniforms,
					depthWrite: false,
					side: THREE.BackSide
				});
				var skyBox = new THREE.Mesh(
					new THREE.BoxGeometry( 10000, 10000, 10000 ),
					skyBoxMaterial
				);
				skyBox.position = new THREE.Vector3(0,0,0);
				skyBox.name = "Skybox";
				scene.add( skyBox );
		},	
	render :function ()
	{
			renderer.render( scene, camera );
			this.keyboardInfo();
			app.clock+=1;
	},
	
    animate: function () {
	
	
		var thisLoop = new Date;
		var fps = 1000 / (thisLoop - app.loopTime);
		app.loopTime = thisLoop;
		app.text[4].innerHTML = "FPS: " + fps.toFixed(2) + "";
		
		window.requestAnimationFrame( app.animate );
		if(app.GuiVarHolder != null)
		{
					app.uniforms.mainLight.value = new THREE.Vector3(Math.cos(app.clock*app.GuiVarHolder.lightX),Math.sin(app.clock*app.GuiVarHolder.lightY),Math.cos(app.clock*app.GuiVarHolder.lightZ));
					app.uniforms.dis.value = app.GuiVarHolder.noiseParam3;
		}
		else
		{
			app.uniforms.mainLight.value = new THREE.Vector3(1,1,1);
		}

		for(var i =0;i<app.currentTransformsArray.length;i++)
		{
			app.currentTransformsArray[i].doTransform(fps);
			if(app.currentTransformsArray[i].end == true)
			{
				//if(app.currentTransformsArray[i].onTransformationFinish!=null)
				//	app.currentTransformsArray.onTransformationFinish();
				app.currentTransformsArray.splice(i,1);
	
			}
		}
			
		//this.stats.update();

		app.render();
    },		
			createText : function(sizeX,sizeY,posX,posY)
			{
			
				var text2 = document.createElement('div');
				text2.style.position = 'absolute';
				text2.style.width = sizeX;
				text2.style.height = sizeY;
				text2.innerHTML = "hi there!";
				text2.style.top = posX + 'px';
				text2.style.left = posY + 'px';
				document.body.appendChild(text2);

				app.text.push(text2);
			},
			
			AddTransform : function(pos,markIndex,timeOfTransform)
			{
				var transform = new this.imageFildersVar.MoveTransformProt();
					transform.endPosition = pos;
					transform.time = timeOfTransform;
					transform.object = app.markerMesh[markIndex];
					transform.id = markIndex;
					transform.setEndPoint();
					transform.onTransformationFinish = function()
					{
						console.log("transFromEnd2");
					}

					app.currentTransformsArray.push(transform);
			},
			
			createSphere : function(i,posZ,size)
			{
				 var sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 4, 2), new THREE.MeshNormalMaterial());
				 sphere.overdraw = true;
				 this.markerObjects.push({key : this.markerIterator, object : sphere , vertexIndex : i});
				 sphere.position = new THREE.Vector3(
					app.terrainElements[0].geometry.vertices[i].x,
					app.terrainElements[0].geometry.vertices[i].y + 1,
					app.terrainElements[0].geometry.vertices[i].z);	 
				sphere.name = " marker_" + this.markerIterator++;
				scene.add(sphere);	
				this.markerMesh.push(sphere);
				
				return sphere.position;
		 			 
				 
			},
			raycastTerrain : function(pos)
			{
			    var point = new THREE.Vector3(pos.x,this.getHeightPoint(pos).y + 1,pos.z);
				this.createLine(pos, point );
			},
			
			moveTransform : function(object,vec)
			{
				object.position.add(vec);
				object.position.y = this.getHeightPoint(object.position).y;
				this.raycastTerrain(object.position);
			},
			
			createLine : function(pointA,pointB)
			{
				var geometry = new THREE.Geometry();

				var material = new THREE.MeshBasicMaterial({
						color: 0xfff0000
					});
			
				geometry.vertices.push(pointA);
				geometry.vertices.push(pointB);				
				var line = new THREE.Line(geometry, material);
				scene.add(line);
			},
			getHeightPoint	: function(pos)
			{
				var rowX = (pos.x - this.createdPlanePosition.x + this.halfOfTheSizeOfPlane)/this.stepSizeX;
				var rowY =  Math.floor(app.GuiVarHolder.gridCount) - (pos.z - this.createdPlanePosition.z + this.halfOfTheSizeOfPlane)/this.stepSizeY ;
				var isBottomTris = (this.frac(rowY) <=  1 - this.frac(rowX)) ? 0 : 1;
				rowX = Math.floor( rowX);
				rowY = Math.floor( rowY);
				
				var faceIndex = rowX*2 + rowY*2*app.GuiVarHolder.gridCount + isBottomTris;
				
				app.text[3].innerHTML = "row X: " + rowX + " row Y: " + rowY + " is bottom : "+ isBottomTris + " Face index : " + faceIndex;
			
				if(faceIndex > app.terrainElements[0].geometry.faces.length)
					return pos;
				
				var Face = app.terrainElements[0].geometry.faces[faceIndex];
				
				var normal = this.calculateNormals(
					app.terrainElements[0].geometry.vertices[Face.a],
					app.terrainElements[0].geometry.vertices[Face.b],
					app.terrainElements[0].geometry.vertices[Face.c]);
					
				
				var pointOfCrossing = normal.x*(-pos.x) + normal.z*(-pos.z) - app.dOfPlane;
							
				pointOfCrossing = -pointOfCrossing/normal.y;
				
				return new THREE.Vector3(pos.x,pointOfCrossing,pos.z);

			},
			
			frac : function(f) {
				return f % 1;
			},
			purgeArrays :function()
			{
				while(this.normalsMap.length > 0) {
					this.normalsMap.pop();
				}
				while(this.noiseValues.length > 0) {
					this.noiseValues.pop();
				}
				while(this.noiseAttributes.displacement.value.length > 0) {
					this.noiseAttributes.displacement.value.pop();
				}

			},
			createPlane :function (vecPos,size,col,sizeOfSub,usePerlin)
			{
				this.purgeArrays();

				var mainGeometry = new THREE.PlaneGeometry( size, size, parseInt(sizeOfSub),parseInt(sizeOfSub));
			
				var color, point, face, numberOfSides, vertexIndex;
				mainGeometry.computeBoundingBox();


				var faceIndices = [ 'a', 'b', 'c', 'd' ];
				var NoiseObject = require('./PerlinSimplex');
				NoiseObject.noiseDetail(this.GuiVarHolder.noiseParam1,this.GuiVarHolder.noiseParam2);
				var values = this.noiseAttributes.displacement.value;
				var valuesColors = this.noiseAttributes.colors.value;
				
				this.stepSizeX = this.stepSizeY = size/sizeOfSub;
				this.halfOfTheSizeOfPlane = size*0.5;
				this.sizeOfPlane = size;
				
				this.createdPlanePosition = vecPos;
				
				for ( var i = 0; i < mainGeometry.vertices.length; i++ ) 
				{
				    point = mainGeometry.vertices[ i ];
				   if(usePerlin)
						var valueNoise = NoiseObject.noise((point.x + this.offset.x)/size,(point.y + this.offset.y)/size ,0,0);
					else 
						var valueNoise =  this.distortionFromImage[i];

				    color = new THREE.Color( 0xffffff );  
				    color.setRGB( valueNoise, valueNoise, valueNoise );
					mainGeometry.vertices[ i ] = new THREE.Vector3(point.x,point.z + valueNoise*this.GuiVarHolder.noiseParam3,point.y);
					//this.noiseAttributes.displacement.value.push(valueNoise*this.GuiVarHolder.noiseParam3);

				    this.noiseValues.push(valueNoise);
				    values.push(valueNoise);
				    valuesColors.push(color);
					

				    this.normalsMap.push(null);
				}
				this.offset.x += point.x;
				this.offset.y += point.y;

				var basicDisplacmentMat = this.getMaterialDis();

				for ( var i = 0; i < mainGeometry.faces.length; i++ ) 
				{
				    face = mainGeometry.faces[ i ];

				    var normalVec = this.calculateNormals(
				    	mainGeometry.vertices[face.a], 
				    	mainGeometry.vertices[face.b], 
				    	mainGeometry.vertices[face.c]);	

				    this.checkAndAdd(face.a, normalVec);
				    this.checkAndAdd(face.b, normalVec);
				    this.checkAndAdd(face.c, normalVec);
				}
				//mainGeometry.faceVertexUvs = [[]];
				//mainGeometry.faceVertexUvs.push([]);
				mainGeometry.uvsNeedUpdate = true;
				for ( var i = 0; i < mainGeometry.faces.length; i++ ) 
				{
				    face = mainGeometry.faces[ i ];

				    face.vertexNormals[0] = this.normalsMap[face.a].normalize();
				    face.vertexNormals[1] = this.normalsMap[face.b].normalize();
				    face.vertexNormals[2] = this.normalsMap[face.c].normalize();
					
					var alfa = new THREE.Vector2(mainGeometry.vertices[face.a].x/size + 0.5,mainGeometry.vertices[face.a].y/size + 0.5);
					var beta = new THREE.Vector2(mainGeometry.vertices[face.b].x/size + 0.5,mainGeometry.vertices[face.b].y/size + 0.5);
					var teta = new THREE.Vector2(mainGeometry.vertices[face.c].x/size + 0.5,mainGeometry.vertices[face.c].y/size + 0.5);
					
					
					mainGeometry.faceVertexUvs[0][i][face.a] = alfa;
					mainGeometry.faceVertexUvs[0][i][face.a] = beta;
					mainGeometry.faceVertexUvs[0][i][face.a] = teta;
				}
				mainGeometry.computeFaceNormals();
				mainTerrrain = new THREE.Mesh(mainGeometry, basicDisplacmentMat);
				mainTerrrain.position = vecPos; 
				mainTerrrain.geometry.materialsNeedUpdate = true;
				mainTerrrain.name = "mainTerrrain";
				
				//var quatX = new THREE.Quaternion();
				//quatX.setFromAxisAngle( new THREE.Vector3(1,0,0), -Math.PI);
				
				//mainTerrrain.quaternion = quatX;
				mainTerrrain.updateMatrixWorld();
				this.scene.add( mainTerrrain );
				
				

				this.terrainElements.push(mainTerrrain);	
			},	
			
			
			checkAndAdd :function(i , vector)
			{
					if( this.normalsMap[i] == null)
				    	this.normalsMap[i] = vector;
					else
					{
						this.normalsMap[i].value+=vector;
					}
			},

			getMaterialDis :function ()
			{
				var mat =  new THREE.ShaderMaterial({
					attributes: app.noiseAttributes,
					uniforms:   app.uniforms,
				    vertexShader: simpleVert.value,
				    fragmentShader: simpleFrag.value,
					side: THREE.BackSide
					
				});
				return mat;
			},
			getMaterialLamb :function ()
			{
				var mat =  new THREE.MeshPhongMaterial({
        		color: 'white' 
      			});
				return mat;
			},
			
			calculateNormals :function ( a, b, c)
			{
				var ab = new THREE.Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
				var ac = new THREE.Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
				
				var i = ab.y*ac.z - ab.z*ac.y;
				var j = ab.x*ac.z - ab.z*ac.x;
				var k = ab.x*ac.y - ab.y*ac.x;
				
				app.dOfPlane = i*(-a.x)  + j*(a.y) + k*(-a.z);
				
				return new THREE.Vector3(i,j,k);
			},
			
			
			setCameraRotation :function (divx,divY)
			{
				if(!app.GuiVarHolder.cameraEnabled)
					return;

				camera.rotation.y-= 0.1*divX/sizeOfCamera;
				camera.rotation.x-= 0.1*divY/sizeOfCamera;

				var x = Math.sin((camera.rotation.x*Math.PI)/180.0);
				var y = Math.sin((camera.rotation.y*Math.PI)/180.0);
				var z = Math.sin((camera.rotation.z*Math.PI)/180.0);
				var mulFactor =  1.0/(x + y + z);


				app.positionTransformVector = new THREE.Vector3(x*mulFactor,y*mulFactor,z*mulFactor);
				app.positionTransformVector.normalize();
			},
			
			rayCastMarkers :function(event)
		    {
				event.preventDefault();
				app.mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
				app.mouseVector.y = 1 - 2 * ( event.clientY /  window.innerHeight );
				app.mouseVector.z =1;
				
				projector.unprojectVector(app.mouseVector, camera);
			
				var raycaster = new THREE.Raycaster(camera.position,app.mouseVector.sub(camera.position).normalize());
				var intersects = raycaster.intersectObjects(scene.children,true);
				
				if (intersects.length > 0) 
				{	
					if(intersects[ 0 ].object.name == "Skybox")
						return -1;
					

					console.log(intersects[ 0 ].object.name);
				
					app.text[5].innerHTML = intersects[ 0 ].object.name;
					if(intersects[ 0 ].object.name.indexOf("marker")!=-1)
					{
						this.selectedObject = intersects[ 0 ].object;
						this.objectSelect = true;
						var indexOfMarker = parseInt(this.selectedObject.name.split("_")[1]);
						
						for(var i = 0;i<this.currentTransformsArray.length;i++)
						{
							if(this.currentTransformsArray[i].id  == indexOfMarker)
							{
								this.currentTransformsArray.splice(i,1);
							}
						}
					
						//this.AddTransform(intersects[ 0 ].face.centroid,0,2);
					}
					else if(this.objectSelect)
					{
						this.objectSelect = false;
						var indexOfMarker = parseInt(this.selectedObject.name.split("_")[1]);
						var point = new THREE.Vector3(intersects[ 0 ].face.centroid.x,0,intersects[ 0 ].face.centroid.y);
						
						
						
						
						this.AddTransform(point,indexOfMarker,2);
						
						
						
					}
				}	
				
			},
			onDocumentMouseMove:function (event)
			{
				event.preventDefault();

				app.divX = event.clientX - app.lastX;
				app.divY = event.clientY - app.lastY;
				
				var x = event.clientX  /app.renderer.domElement.width;
				var y = event.clientY /app.renderer.domElement.height;
				
				if(x > 1 || y > 1 || y < 0 || x < 0)
				return;
				
				app.angleX = Math.atan((x-0.5))*0.5;
				app.angleY = Math.atan((y-0.5))*0.5;
				
				app.lastY = event.clientY;
				app.lastX = event.clientX;
				


			},
			onDocumentMouseUp:function (event)
			{
				event.preventDefault();
				
				this.wasClicked = !this.wasClicked;
				
			},
			
			calculateForward : function()
			{
				if(!app.GuiVarHolder.cameraEnabled)
					return;
				app.currentForward = new THREE.Vector3(
					Math.cos(app.angleX)*app.mainForward.x - Math.sin(app.angleX)*app.mainForward.z,
					0,
					Math.sin(app.angleX)*app.mainForward.x + Math.cos(app.angleX)*app.mainForward.z
				);			

				camera.rotation.y = -app.angleX*(180/Math.PI);
				camera.rotation.x = -app.angleY*(180/Math.PI)*0.2;
			},
			
			textureIsLoaded : function(e) 
			{
				app.uniforms.texture.value = THREE.ImageUtils.loadTexture(e.target.result);
			},
			imageIsLoaded : function(e) 
			{
				var node = document.getElementById("example-container").lastChild;
				document.getElementById("example-container").appendChild(node);
			//	document.getElementById("myImg").width = document.getElementById("myImg").width
			//	document.getElementById("myImg").src =  e.target.result;
			//    document.getElementById("convertedImage").src =  e.target.result;
			    document.getElementById("myImg").src =  e.target.result;
			    document.getElementById("convertedImage").src =e.target.result;;
			    
				app.uniforms.texture.value = THREE.ImageUtils.loadTexture(e.target.result);
				
			    Caman("#myImg","#myImg", function () {

			    	this.resize({
					    width: app.GuiVarHolder.gridCount+1,
					    height:app.GuiVarHolder.gridCount+1
					  });
			    	this.render();

				});

			    while(app.distortionFromImage.length > 0) {
					app.distortionFromImage.pop();
				}

			    Caman("#convertedImage","#convertedImage", function () {
			    	this.resize({
					    width: app.GuiVarHolder.gridCount+1,
					    height:app.GuiVarHolder.gridCount+1
					  }).render();
			    	this.contrast(app.imageFildersVar.contrast);
					this.brightness(app.imageFildersVar.contrast);
					this.stackBlur(app.imageFildersVar.stackBlur);
					this.gamma(app.imageFildersVar.gamma);
					this.exposure(app.imageFildersVar.exposure);
			    	
			    	this.example();
			    	this.render();
			    	
				});

			},
			 

	
	
	
  };
  return app;
} );
