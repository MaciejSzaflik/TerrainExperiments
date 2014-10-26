varying lowp vec4 vColor;
varying vec3 passNormal;
uniform vec3 mainLight;
uniform vec3 lightColorDiffuse;

void main() {
	            vec3 light = mainLight;
				// ensure it's normalized
				light = normalize(light);
				float dProd = max(0.0, dot(passNormal, light));
				//feed into our frag colour
				gl_FragColor = vec4(dProd*lightColorDiffuse.x, dProd*lightColorDiffuse.y, dProd*lightColorDiffuse.z, 1.0);
}