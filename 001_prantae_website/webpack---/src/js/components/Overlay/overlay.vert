export default "#define GLSLIFY 1\nuniform float distance;\nuniform float fov;\nuniform vec2 uSize;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n\n  // make plane fullscreen size\n  vec3 pSign = sign(position);\n  float h = distance * tan(fov);\n  vec3 p = vec3(h, h, position.z) * pSign;\n\n  p.x = h * (uSize.x / uSize.y) * pSign.x;\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\n}\n";