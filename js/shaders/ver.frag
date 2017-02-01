varying vec3 passNormal;
uniform vec3 mainLight;
uniform vec3 lightColorDiffuse;
uniform vec3 ambient;
varying vec3 coords;
uniform float times;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
varying vec2 vUv;


vec3 getTriPlanarBlend(vec3 _wNorm){
    // in wNorm is the world-space normal of the fragment
    vec3 blending = abs( _wNorm );
    blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);
    return blending;
}

void main() {
	            vec3 light = mainLight;
				light = normalize(light);
				float dProd = max(0.0, dot(passNormal, light));
				vec4 lightColor = vec4(dProd*lightColorDiffuse.x + ambient.x, 
									   dProd*lightColorDiffuse.y + ambient.y,
									   dProd*lightColorDiffuse.z+ + ambient.z, 
									   1.0);	
									   
				vec3 blending = getTriPlanarBlend( passNormal );
				blending = normalize(max(blending, 0.00001)); 
				vec2 scale = vec2(times,times);
				vec4 xaxis =   texture2D( texture1, fract(coords.yz*scale));
				vec4 yaxis =  texture2D( texture2, fract(coords.xz*scale));
				vec4 zaxis =  texture2D( texture3, fract(coords.xy*scale));

				vec4 tex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
 				
				gl_FragColor =  tex*lightColor;
}




