export default "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec3 uColor;\nuniform float uProgress;\nuniform vec2 uSize;\nuniform float uZoom;\nuniform bool uReverse;\n// MSDF\nuniform sampler2D map;\nuniform float opacity;\n\nvarying vec2 vUv;\nvarying vec2 vUvLine;\nvarying float vUvLineHeight;\n\n#define PI 3.14159265358979323846\n\nfloat circle(vec2 uv, float radius) {\n\tfloat border = 0.01;\n\tfloat dist = radius - distance(uv, vec2(0.5));\n  // top right corner\n  float distTR = radius - distance(uv - vec2(1.0 / 3.0, 1.0), vec2(0.5));\n  float tr = smoothstep(0.0, border, distTR);\n\n  // top left corner\n  float distTL = radius - distance(uv - vec2(-2.0 / 3.0, 1.0), vec2(0.5));\n  float tl = smoothstep(0.0, border, distTL);\n\n  // bottom right corner\n  float distBR = radius - distance(uv - vec2(2.0 / 3.0, -1.0), vec2(0.5));\n  float br = smoothstep(0.0, border, distBR);\n\n  // bottom left corner\n  float distBL = radius - distance(uv - vec2(-1.0 / 3.0, -1.0), vec2(0.5));\n  float bl = smoothstep(0.0, border, distBL);\n\n  float center = smoothstep(0.0, border, dist);\n\n  return center + tr + tl + br + bl;\n}\n\nfloat median(float r, float g, float b) {\n  return max(min(r, g), min(max(r, g), b));\n}\n\nvoid main(void) {\n  // Circles fill animation\n\n  // Set up grid\n  vec2 grid = vec2(vUvLine.x * uSize.x * uZoom, vUvLine.y * uSize.y * uZoom);\n  // offset on 3 parts\n  grid.x += step(1.0, mod(grid.y, 3.0)) * 2.0 / 3.0;\n  grid.x += step(1.0, mod(grid.y + 1.0, 3.0)) * 1.0 / 3.0;\n  // grid.x += step(1.0, mod(grid.y, 2.0)) * 0.5;\n\n  grid = fract(grid); // Wrap around 1.0\n\n  // progress\n  float uvXY = (vUvLine.x + vUvLineHeight) / 2.0;\n  float progress;\n\n  if (uReverse) {\n    progress = 1.0 + uvXY - (uProgress * 2.0);\n  } else {\n    progress = (1.0 - uvXY) - (1.0 - uProgress * 2.0);\n  }\n\n  float alpha = circle(grid, progress);\n\n  // MSDF code\n  vec3 sample = texture2D(map, vUv).rgb;\n  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;\n  alpha *= clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);\n\n  gl_FragColor = vec4(uColor, alpha * opacity);\n  if (gl_FragColor.a < 0.0001) discard;\n\n}\n";