export default "\nprecision highp float;\n#define GLSLIFY 1\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nuniform vec2 uResolution;\nuniform float uNoise;\nuniform float uMaxColor;\nuniform float uMinColor;\nuniform float uTime;\n\nvarying vec2 vP0;\nvarying vec2 vP1;\nvarying vec4 vColorA;\nvarying vec4 vColorB;\nvarying vec4 vColorC;\nvarying vec4 vColorD;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / uResolution.xy;\n\n  float mixValue0 = distance(uv, vP0);\n  float mixValue1 = distance(uv, vP1);\n\n  mixValue0 = clamp(mixValue0, 0.0, 1.0);\n  mixValue1 = clamp(mixValue1, 0.0, 1.0);\n\n  mixValue0 = smoothstep(0.0, 1.0, mixValue0);\n  mixValue1 = smoothstep(0.0, 1.0, mixValue1);\n\n  vec4 radialA = mix(vColorA, vColorB, mixValue0);\n  vec4 radialB = mix(vColorC, vColorD, mixValue1);\n\n  vec4 color = mix(radialA, radialB, uv.x);\n\n  // Add noise\n  uv *= 4.91 * 100.;\n  // uv += uTime * 1.3;\n\n  vec3 textureNoise = vec3(snoise(uv)) * 1.35;\n  float maxColor = uMaxColor;\n  float minColor = uMinColor;\n\n  textureNoise.r = clamp(textureNoise.r, minColor, maxColor);\n  textureNoise.g = clamp(textureNoise.g, minColor, maxColor);\n  textureNoise.b = clamp(textureNoise.b, minColor, maxColor);\n\n  gl_FragColor = vec4(mix(textureNoise, color.rgb, 0.87), 1.);\n}\n";