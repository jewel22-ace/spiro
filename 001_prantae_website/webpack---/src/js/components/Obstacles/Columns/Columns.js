// import * as THREE from 'three'
import {
    TimelineLite
} from 'gsap/gsap-core'
import {
    randomFloat
} from '../../../utils/math'
import LinesManager from '~managers/LinesManager'
import Obstacle from '../Obstacle'
import SoundManager, {
    SOUNDS_CONST
} from '../../../managers/SoundManager'

const RADIUS = 3
const HEIGHT = 15.5
const GEOMETRY = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32)
GEOMETRY.translate(0, HEIGHT / 2, 0)

export default class Columns extends Obstacle {
    nbColumns = 6
    columns = []
    constructor(grainMaterial, scrollValue, index) {
        super(scrollValue)

        const offsetRadius = 8.5
        const radius = 100
        const {
            points
        } = LinesManager.mainRoad
        let inc = 0.01

        this.object3D.visible = false

        for (let i = 0; i < this.nbColumns; i++) {
            const {
                angle,
                position: pointPosition,
                center,
                directionCenter
            } = points[
                Math.round(points.length * (scrollValue + inc * i))
            ]
            const dir = i % 2 ? -1 : 1
            const randomOffsetRadius = randomFloat(0, 6)
            const offsetRadiusFinal = offsetRadius + randomOffsetRadius

            const x =
                Math.cos(THREE.MathUtils.degToRad(angle)) * (radius + directionCenter * offsetRadiusFinal * dir) + center.x
            const z = Math.sin(THREE.MathUtils.degToRad(angle)) * (radius + directionCenter * offsetRadiusFinal * dir)
            const position = new THREE.Vector3(x, pointPosition.y, z)

            const mesh = new THREE.Mesh(GEOMETRY, grainMaterial)
            mesh.position.copy(position)

            const scaleR = randomFloat(0.4, 0.6)
            const scaleH = randomFloat(0.6, 1)
            mesh.scaleR = scaleR
            mesh.scaleH = scaleH
            mesh.scale.set(scaleR, 0.00001, scaleR)
            mesh.name = `obstacle_column_${index}_${i}`

            this.columns.push(mesh)
            this.object3D.add(mesh)
        }
    }

    fadeIn() {
        if (this.isFadedIn) return
        super.fadeIn()
        this.object3D.visible = true
    }

    click(mesh) {
        if (mesh.isScaling) return
        SoundManager.trigger(SOUNDS_CONST.CLICK)
        const tl = new TimelineLite()
        mesh.isScaling = true

        const scale = {
            value: mesh.scaleH,
        }
        tl.to(
            scale, {
                duration: 0.5,
                value: 0.0001,
                ease: 'expo.out',
                onUpdate: () => {
                    mesh.scale.set(mesh.scaleR, scale.value, mesh.scaleR)
                },
            },
            0,
        )

        tl.to(
            scale, {
                duration: 1.4,
                value: mesh.scaleH,
                ease: 'bounce.out',
                onUpdate: () => {
                    mesh.scale.set(mesh.scaleR, scale.value, mesh.scaleR)
                },
            },
            0.35,
        )

        tl.add(() => {
            mesh.isScaling = false
        }, 0.8)
    }

    triggered() {
        if (this.isTriggered) return
        super.triggered()
        const duration = 1.4

        const tl = new TimelineLite()
        const delay = 0.15

        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i]

            const scale = {
                value: 0.0001,
            }
            tl.to(
                scale, {
                    duration,
                    value: column.scaleH,
                    ease: 'bounce.out',
                    onUpdate: () => {
                        column.scale.set(column.scaleR, scale.value, column.scaleR)
                    },
                },
                delay * i,
            )
        }

        this.tlTriggered = tl
    }

    reset() {
        if (this.tlTriggered) this.tlTriggered.kill()
        this.tlTriggered = null
        if (this.isReset) return
        super.reset()

        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i]
            column.scale.set(column.scaleR, 0.00001, column.scaleR)
        }

        this.object3D.visible = false
    }
}