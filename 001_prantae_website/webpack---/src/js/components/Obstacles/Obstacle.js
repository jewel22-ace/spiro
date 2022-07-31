import LinesManager from '~managers/LinesManager'
// import * as THREE from 'three'

export default class Obstacle {
    object3D = new THREE.Object3D()
    isReset = true
    constructor(scrollValue) {
        this.scrollValue = scrollValue
        this.position = LinesManager.mainTrail.getPoint(scrollValue)
    }

    fadeIn() {
        this.isReset = false
        this.isTriggered = false
        this.isFadedIn = true
    }

    triggered() {
        this.isReset = false
        this.isFadedIn = false
        this.isTriggered = true
    }

    reset() {
        this.isReset = true
        this.isFadedIn = false
        this.isTriggered = false
    }
}