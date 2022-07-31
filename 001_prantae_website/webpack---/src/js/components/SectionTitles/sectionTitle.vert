export default "#define GLSLIFY 1\nattribute vec2 uv;\nattribute vec4 position;\nattribute float indexChar;\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform vec2 uSize;\nuniform float uProgressY;\nuniform float uProgress;\nuniform bool uReverse;\nuniform float uZoom;\nuniform float uHeight;\nuniform float uNbChars;\n\nvarying vec2 vUv;\nvarying vec2 vUvLine;\nvarying float vUvLineHeight;\n\nconst float SCALE = 2. * 2.;\nconst float INIT_Y = 18.; // Note that Y is reversed with scale.set(1, -1, 1)\n\n#define PI 3.14159265358979323846\n\nvec2 angleToVec2(float angleInDegrees) {\n  float angleInRadians = angleInDegrees * PI / 180.;\n  float x = sin(angleInRadians);\n  float y = cos(angleInRadians);\n  return vec2(x, y);\n}\n\nvoid main(void) {\n  // UVs for creating a grid on based on the size of the word\n  vUvLine = vec2(position.x / uSize.x, position.y / uSize.y );\n  // values in Y here goes to 0 to negative max Height\n  vUvLineHeight = -position.y / uHeight;\n  // UVs for MSDF shader\n  vUv = uv;\n\n  vec3 mPosition = vec3(position.x, position.y, position.z);\n\n  // Y letter stagger progress\n  // Letter percent\n  float segment = 1. / uNbChars;\n  float letter = indexChar * segment;\n\n  if (!uReverse) {\n    float offsetYProgress = max(INIT_Y * (1. - uProgressY / letter), 0.);\n    mPosition.y += (offsetYProgress);\n    // rotation\n    vec2 angleVec = angleToVec2(-7.5 * (1. - uProgressY));\n    vec2 rotatedPosition = vec2(\n      mPosition.x * angleVec.y + mPosition.y * angleVec.x,\n      mPosition.y * angleVec.y - mPosition.x * angleVec.x);\n\n    mPosition.x = rotatedPosition.x;\n    mPosition.y = rotatedPosition.y;\n  }\n\n  // center geometry\n  mPosition.y += uHeight / 2. - uSize.y;\n  mPosition.x -= uSize.x / 2.;\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(mPosition / SCALE, 1.0);\n}\n";