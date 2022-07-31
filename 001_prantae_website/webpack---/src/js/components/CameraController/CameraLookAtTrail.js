import {
    CatmullRomCurve3
} from 'three'
import LinesManager from '~managers/LinesManager'

export default class CameraLookAtTrail {
    constructor() {
        // intro
        const {
            extraPoints
        } = LinesManager.createLine({
            offsetY: 6
        })
        // create trail for camera
        const finalTrail = new CatmullRomCurve3(extraPoints)
        // For debug
        return finalTrail
    }
}