// import * as THREE from 'three'

export default class Light {
    constructor(position) {
        const pointLight = new THREE.Mesh(
            new THREE.SphereBufferGeometry(10, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xff0000
            }),
        )
        const vec3 = new THREE.Vector3(position.x, position.y, position.z)
        pointLight.position.copy(vec3)
        // pointLight.visible = false

        return pointLight
    }
}