define( ["three", "camera", "controls", 
"geometry", "light", "material", "renderer", 
"scene","dat","PerlinSimplex",
"shader!ver.vert", "shader!ver.frag"],
function ( THREE, camera, controls, geometry, 
light, material, renderer, scene ,verVert, verFrag,simpleVert, simpleFrag) {
  var app = {
  
			GuiVarHolder : null,

			camera,
			scene, 
			renderer,

			text : [],
			positionTransformVector : new THREE.Vector3(0,0,0),
			noiseValues : [],
			distortionFromImage : [],
			normalsMap : [],

			x : 0,
			y : 0,

			terrainElements : [],

			keyboardInteraction : null,
			mainTerrrain : null,

			objectSelect : false,
			selectedObject : null,
			indexPoint : 0,

			//Mouse variables
			lastX : 0,
			lastY : 0,
			divX : 0,
			divY : 0,
			wasClicked : false,
			firstInteraction : false,
			cameraEnabled : false,
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
			},

		    clock : 0,
			
			
			
	
	
	initializeGUI : function(){
	 this.GuiVarHolder = new this.FizzyText();
			  console.log("ïm here");
			  var gui = new dat.GUI();

			  var f1 = gui.addFolder('ControlsEnabled');

			  f1.add(this.GuiVarHolder, 'cameraEnabled');
			  f1.add(this.GuiVarHolder, 'rotationEnabled');
			  f1.add(this.GuiVarHolder, 'keyboardEnabled');

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
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(value,this.GuiVarHolder.lightCG,this.GuiVarHolder.lightCB);
			  });
			  colorControler2.onChange(function(value) {
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(this.GuiVarHolder.lightCR,value,this.GuiVarHolder.lightCB);
			  });
			  colorControler3.onChange(function(value) {
			  	uniforms.lightColorDiffuse.value = new THREE.Vector3(this.GuiVarHolder.lightCR,this.GuiVarHolder.lightCG,value);
			  });
			 // f3.add(GuiVarHolder, 'color3');
			  f3.add(this.GuiVarHolder, 'setColor');

			  var f4 = gui.addFolder('TerrainOperations');
			  	var f5 = f4.addFolder('CreatedPlaneOptions');

			  	f5.add(this.GuiVarHolder, 'mainSize',2,1000);
			  	f5.add(this.GuiVarHolder, 'gridCount',2,300);

			  	f5.add(this.GuiVarHolder, 'noiseParam1',-1,10);
			  	f5.add(this.GuiVarHolder, 'noiseParam2',0,1);
			  	f5.add(this.GuiVarHolder, 'noiseParam3',-10,100);

			  f4.add(this.GuiVarHolder, 'removePlane');
			  f4.add(this.GuiVarHolder, 'createPlane');
			  f4.add(this.GuiVarHolder, 'createPlaneFromImage');

			 //gui.add(text, 'explode');
			
			},
	
    init: function () {
     this.initializeGUI();
	 console.log("simpleFrag " + simpleFrag.value);
	 console.log("simpleVert " +simpleVert.value);
	 
	 /*app.stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );*/
	document.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', this.onDocumentMouseUp, false );
    },
	render :function ()
	{
				renderer.render( scene, camera );
				//keyboardInfo();
				app.clock+=1;
	},
    animate: function () {
      window.requestAnimationFrame( app.animate );
	if(app.GuiVarHolder != null)
	{
				app.uniforms.mainLight.value = new THREE.Vector3(Math.cos(app.clock*app.GuiVarHolder.lightX),Math.sin(app.clock*app.GuiVarHolder.lightY),Math.cos(app.clock*app.GuiVarHolder.lightZ));
	}
	else
	{
		app.uniforms.mainLight.value = new THREE.Vector3(1,1,1);
	}

				//this.stats.update();

		app.render();
    },
	
	
			  FizzyText :function(){
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

			  	app.createPlane(new THREE.Vector3(0,-15,0),this.mainSize,0xffffff,(this.gridCount%2 == 1)?this.gridCount - 1:this.gridCount,true);
			  }
			  this.createPlaneFromImage = function()
			  {
			  	this.removePlane();

			  	createPlane(new THREE.Vector3(0,-15,0),this.mainSize,0xffffff,this.gridCount,false);
			  }
			  
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

				text.push(text2);
			},
			purgeArrays :function()
			{
				while(this.normalsMap.length > 0) {
					this.normalsMap.pop();
				}
				while(this.noiseValues.length > 0) {
					this.noiseValues.pop();
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

				for ( var i = 0; i < mainGeometry.vertices.length; i++ ) 
				{
				    point = mainGeometry.vertices[ i ];
				   if(usePerlin)
						var valueNoise = NoiseObject.noise((point.x + this.offset.x)/size,(point.y + this.offset.y)/size ,0,0);
					else 
						var valueNoise =  distortionFromImage[i];

				    color = new THREE.Color( 0xffffff );  
				    color.setRGB( valueNoise, valueNoise, valueNoise );
					mainGeometry.vertices[ i ] = new THREE.Vector3(point.x,point.y,point.z + valueNoise*this.GuiVarHolder.noiseParam3);

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

				for ( var i = 0; i < mainGeometry.faces.length; i++ ) 
				{
				    face = mainGeometry.faces[ i ];

				    face.vertexNormals[0] = this.normalsMap[face.a].normalize();
				    face.vertexNormals[1] = this.normalsMap[face.b].normalize();
				    face.vertexNormals[2] = this.normalsMap[face.c].normalize();

				}



				mainTerrrain = new THREE.Mesh(mainGeometry, basicDisplacmentMat);
				mainTerrrain.position = vecPos; 
				mainTerrrain.geometry.materialsNeedUpdate = true;

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
				   // mat.shading = THREE.
				});
				//mat.wireframe = true;
				//mat.lights = true;
				//mat.shading = THREE.FlatShading;
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
			
			onDocumentMouseDown: function (event)
		    {
				event.preventDefault();
				app.wasClicked = true;
				app.firstInteraction = true;
				app.lastY = event.clientY;
				app.lastX = event.clientX;
				
			},
			onDocumentMouseMove:function (event)
			{
				event.preventDefault();

					app.divX = event.clientX - app.lastX;
					app.divY = event.clientY - app.lastY;

				if(app.wasClicked && app.GuiVarHolder.rotationEnabled)
				{	
					if(app.terrainElements[app.terrainElements.length-1] != null)
					{
						app.terrainElements[app.terrainElements.length-1].rotation.x+=app.divY/50;
						app.terrainElements[app.terrainElements.length-1].rotation.y+=app.divX/50;
					}
	
				}
				else if(app.firstInteraction)
				{
					app.setCameraRotation(divX,divY);
				}
				app.lastY = event.clientY;
				app.lastX = event.clientX;


			},
			 

	
	
	
  };
  return app;
} );
