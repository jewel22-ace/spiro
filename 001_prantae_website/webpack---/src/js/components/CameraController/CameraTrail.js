import LinesManager from '~managers/LinesManager'
import {
    CatmullRomCurve3
} from 'three'

export default class CameraTrail {
    constructor() {

        const {
            extraPoints
        } = LinesManager.createLine({
            offsetY: 15
        })
        // create trail for camera
        const finalTrail = new CatmullRomCurve3(extraPoints)
        // For debug
        return finalTrail
    }
}