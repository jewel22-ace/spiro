// import * as THREE from 'three'
import {
    TimelineLite,
    TweenLite
} from 'gsap/gsap-core'
import SoundManager, {
    SOUNDS_CONST
} from '../../../managers/SoundManager'
import {
    randomFloat
} from '../../../utils/math'
import Obstacle from '../Obstacle'

const GEOMETRY = new THREE.BoxBufferGeometry(1, 1, 1)
GEOMETRY.translate(0, 1 / 2, 0)
GEOMETRY.computeBoundingBox()

export default class Boxes extends Obstacle {
    offset = 0
    s = 10
    halfS = 10 / 2

    constructor(grainMaterial, scrollValue, id) {
        super(scrollValue)

        const s = this.s
        const halfS = this.halfS

        this.object3D.position.copy(this.position)
        this.innerBoxes = []

        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(GEOMETRY, grainMaterial)
            this.positionBox(mesh, i)

            mesh.name = `obstacle_box_${id}`

            mesh.scale.set(halfS, halfS, halfS)
            this.object3D.add(mesh)
            this.innerBoxes.push(mesh)
        }

        this.object3D.scale.set(0.01, 0.01, 0.01)
    }

    positionBox = (mesh, i) => {
        const box = mesh

        switch (i) {
            case 1:
                box.position.x = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 2:
                box.position.z = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 3:
                box.position.z = GEOMETRY.boundingBox.max.y * this.halfS
                box.position.x = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 4:
                box.position.y = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 5:
                box.position.x = GEOMETRY.boundingBox.max.y * this.halfS
                box.position.y = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 6:
                box.position.z = GEOMETRY.boundingBox.max.y * this.halfS
                box.position.y = GEOMETRY.boundingBox.max.y * this.halfS
                break
            case 7:
                box.position.z = GEOMETRY.boundingBox.max.y * this.halfS
                box.position.x = GEOMETRY.boundingBox.max.y * this.halfS
                box.position.y = GEOMETRY.boundingBox.max.y * this.halfS
                break
        }

        // box.position.x -= this.halfS / 2
        // box.position.y -= this.halfS / 2
        // box.position.z -= this.halfS / 2
        box.rotation.y = 0
        box.rotation.x = 0
    }

    render() {
        if (!this.isTriggered) {
            // this.object3D.rotation.y += 0.004
        }
    }

    fadeIn() {
        if (this.isFadedIn) return
        super.fadeIn()
        this.object3D.visible = true
        const duration = 1.4
        const scale = {
            value: 0.01,
        }

        TweenLite.to(scale, {
            duration,
            value: 1,
            ease: 'bounce.out',
            onUpdate: () => {
                this.object3D.scale.set(scale.value, scale.value, scale.value)
            },
        })
    }

    click() {
        this.triggered()
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    triggered = () => {
        if (this.isTriggered) return
        super.triggered()

        const tl = new TimelineLite()

        for (let i = 0; i < 4; i++) {
            const vec3 = new THREE.Vector3(0)
            const vec3Bottom = new THREE.Vector3(0)
            const box = this.innerBoxes[i + 4]
            const bottomBox = this.innerBoxes[i]

            vec3.copy(box.position)
            vec3.x += randomFloat(0, 2) - this.halfS
            vec3.y += randomFloat(0, 2)
            vec3.z += randomFloat(0, 2) - this.halfS
            vec3.normalize()

            vec3Bottom.copy(box.position)
            vec3Bottom.x += randomFloat(0, 2) - this.halfS
            vec3Bottom.y += randomFloat(0, 2)
            vec3Bottom.z += randomFloat(0, 2) - this.halfS
            vec3Bottom.normalize()

            const expulse = {
                value: 0,
            }
            const duration = 5
            const gravityY = -0.04
            let forceY = 0
            const expulseForce = randomFloat(1.4, 1.8)
            const rotationForceY = randomFloat(0.01, 0.1)
            const rotationForceX = randomFloat(0.01, 0.1)
            const delay = randomFloat(0.01, 0.07)

            tl.to(
                expulse, {
                    duration,
                    value: 1,
                    onUpdate: () => {
                        box.position.addScaledVector(vec3, expulseForce)
                        forceY += gravityY
                        box.position.y += forceY
                        box.rotation.y += rotationForceY
                        box.rotation.x += rotationForceX
                    },
                },
                delay,
            )

            const expulseBottom = {
                value: 0,
            }

            let forceYBottom = 0
            const expulseForceBottom = randomFloat(1, 1.4)
            const rotationForceYBottom = randomFloat(0.01, 0.1)
            const rotationForceXBottom = randomFloat(0.01, 0.1)
            const delayBottom = randomFloat(0.01, 0.07)

            tl.to(
                expulseBottom, {
                    duration,
                    value: 1,
                    onUpdate: () => {
                        bottomBox.position.addScaledVector(vec3Bottom, expulseForceBottom)
                        forceYBottom += gravityY
                        bottomBox.position.y += forceYBottom
                        bottomBox.rotation.y += rotationForceYBottom
                        bottomBox.rotation.x += rotationForceXBottom
                    },
                },
                delayBottom,
            )
        }

        this.tlExplode = tl
    }

    reset() {
        if (this.isReset) return
        super.reset()
        if (this.tlExplode) this.tlExplode.kill()

        for (let i = 0; i < 8; i++) {
            this.innerBoxes[i].position.x = 0
            this.innerBoxes[i].position.y = 0
            this.innerBoxes[i].position.z = 0
            this.positionBox(this.innerBoxes[i], i)
        }
        this.object3D.visible = false
    }
}