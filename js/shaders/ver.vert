varying vec3 passNormal;
varying vec3 coords;
varying vec2 vUv;
uniform float dis;
		 
void main() {
		    	passNormal = normalize(normal);
		        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				coords =  position;
		    }