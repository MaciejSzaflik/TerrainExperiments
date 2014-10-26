define( ["three", "container"], function ( THREE, container ) {
  
  var sizeOfCamera = 50;
  var camera = new THREE.PerspectiveCamera( sizeOfCamera, 1, 0.1, 500 );
  camera.position.z = 100;

  var updateSize = function () {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener( 'resize', updateSize, false );
  updateSize();

  return camera;
} );
