import {
    MathUtils
} from 'three'
// import * as THREE from 'three'

export function degToRad(value) {
    return MathUtils.degToRad(value)
}

export function radToDeg(value) {
    return MathUtils.radToDeg(value)
}

export function vec3ToFloat32(vectors) {
    // Transform this list of point into an Float32Array
    const array = new Float32Array(vectors.length * 3)
    let j = 0
    for (let i = 0; i < vectors.length; i++) {
        array[j] = vectors[i].x
        array[j + 1] = vectors[i].y
        array[j + 2] = vectors[i].z
        j += 3
    }
    return array
}

export function sortPoints(mesh, camera) {
    const vector = new THREE.Vector3()
    const {
        geometry
    } = mesh

    // Model View Projection matrix

    const matrix = new THREE.Matrix4()
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    matrix.multiply(mesh.object3d.matrixWorld)

    let index = geometry.getIndex()
    const positions = geometry.getAttribute('position').array
    const length = positions.length / 3

    if (index === null) {
        const array = new Uint16Array(length)

        for (let i = 0; i < length; i++) {
            array[i] = i
        }

        index = new THREE.BufferAttribute(array, 1)

        geometry.setIndex(index)
    }

    const sortArray = []

    for (let i = 0; i < length; i++) {
        vector.fromArray(positions, i * 3)
        vector.applyMatrix4(matrix)

        sortArray.push([vector.z, i])
    }

    function numericalSort(a, b) {
        return b[0] - a[0]
    }

    sortArray.sort(numericalSort)

    const indices = index.array

    for (let i = 0; i < length; i++) {
        indices[i] = sortArray[i][1]
    }

    geometry.index.needsUpdate = true
}

// export function distanceVector(v1, v2) {
//   const dx = v1.x - v2.x
//   const dy = v1.y - v2.y
//   const dz = v1.z - v2.z

//   return Math.sqrt(dx * dx + dy * dy + dz * dz)
// }

// Just use Threejs distanceTo() here