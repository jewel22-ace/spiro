export default "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n\n// Variable qualifiers that come with the shader\nprecision highp float;\n#define GLSLIFY 1\nuniform float opacity;\nuniform vec3 color;\nuniform sampler2D map;\nvarying vec2 vUv;\n// We passed this one\nuniform float time;\n\nfloat median(float r, float g, float b) {\n  return max(min(r, g), min(max(r, g), b));\n}\n\nvoid main() {\n  // This is the code that comes to produce msdf\n  vec3 sample = texture2D(map, vUv).rgb;\n  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;\n  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);\n\n  gl_FragColor = vec4(color, alpha * opacity);\n  if (gl_FragColor.a < 0.0001) discard;\n}\n";