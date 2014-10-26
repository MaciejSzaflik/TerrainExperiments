attribute float displacement;
attribute vec3 colors;
varying lowp vec4 vColor;
varying vec3 passNormal;
		 
void main() {
		    	passNormal = normalize(normal);
		        vec3 newPosition = position +  vec3(0,0,displacement*0.0);
		        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
		        vColor = vec4(colors,1);
		    }