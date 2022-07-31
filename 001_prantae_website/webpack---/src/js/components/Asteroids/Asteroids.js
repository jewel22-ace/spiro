import LinesManager from '../../managers/LinesManager'
import Asteroid from './Asteroid'
import {
    degToRad
} from '~utils/three'

export default class Asteroids {
    object3D = new THREE.Object3D()
    items = []
    constructor(scene, obstacles) {
        const materialElectronGrain = obstacles.materialElectronGrain
        const materialElectronPattern = obstacles.materialElectronPattern
        const materialElectronPlain = obstacles.materialElectronPlain
        this.materialPattern = materialElectronPattern
        const offsetRadius = 85
        const radius = 100
        const nb = 22

        const intvProg = 1 / nb
        let prog = 0
        const {
            points
        } = LinesManager.mainRoad

        for (let i = 0; i < nb; i++) {
            const {
                angle,
                position: pointPosition,
                center
            } = points[Math.round(points.length * prog)]
            // let directionCenter = points[Math.round(points.length * prog)].directionCenter
            prog += intvProg

            // use that to change element to opposite way
            let dirOppositeWay = 1
            if (i === 2 || i === 5) {
                dirOppositeWay = -1
                // directionCenter *= -1
            }

            const x = Math.cos(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius) + center.x
            const z = Math.sin(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius)
            const position = new THREE.Vector3(x, pointPosition.y, z)
            const asteroid = new Asteroid(
                [materialElectronGrain.material, materialElectronPattern.material, materialElectronPlain.material],
                prog,
                position,
                i,
            )

            this.object3D.add(asteroid.object3D)
            this.items.push(asteroid)
        }

        scene.add(this.object3D)
    }

    render(now) {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].render(now)
        }

        this.materialPattern.material.uniforms.uFract.value = ((Math.sin(now) + 1) / 2) * 0.7 + 0.15
        // ((Math.sin(now / 750) + 1) / 2) * 0.7 + 0.15
    }

    hideAll() {
        clearTimeout(this.timeoutShowAll)
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].fadeOut(true)
        }
    }

    showAll() {
        this.timeoutShowAll = setTimeout(() => {
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].scrollDetect = true
            }
        }, 3000)
    }
}