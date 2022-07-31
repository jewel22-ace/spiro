// import * as THREE from 'three'
import {
    randomFloat,
    randomInt
} from '../../../utils/math'
import {
    TimelineLite,
    TweenLite
} from 'gsap/gsap-core'
import Obstacle from '../Obstacle'
import LinesManager from '~managers/LinesManager'
import SoundManager, {
    SOUNDS_CONST
} from '../../../managers/SoundManager'

export const SPHERE_GEOMETRY = new THREE.SphereBufferGeometry(1, 32, 32)

export default class Electrons extends Obstacle {
    centerMesh
    electrons = []
    nbElectrons = 9
    grainMaterial
    expanded = false
    radiusIntv = 2
    canRender = false

    constructor(materials, scrollValue, index) {
        super(scrollValue)
        this.materials = materials

        const {
            points
        } = LinesManager.mainRoad
        const pointOnRoad = points[Math.round(scrollValue * points.length)]
        this.centerRoad = new THREE.Vector3(pointOnRoad.center.x, 0, 0)

        // uNoiseCoef = 1.4
        this.centerMesh = new THREE.Mesh(SPHERE_GEOMETRY, this.materials[0])
        this.centerMesh.name = `electronCenter_${index}`
        this.object3D.position.copy(this.position)
        this.object3D.position.y += 9
        const s = 8
        this.centerScale = s
        this.centerMesh.scale.set(s, s, s)
        this.object3D.add(this.centerMesh)
        this.object3D.visible = false
        const gs = 0.6
        this.object3D.scale.set(gs, gs, gs)

        this.initElectrons()
    }

    initElectrons() {
        this.electrons = []
        for (let i = 0; i < this.nbElectrons; i++) {
            const parent = new THREE.Object3D()
            parent.position.copy(this.centerMesh.position)
            const electron = new THREE.Mesh(SPHERE_GEOMETRY, this.materials[i % 3])
            const radius = randomFloat(7, 11)
            const scale = randomFloat(1.4, 1.9)
            const forceX = randomFloat(0.001, 0.02)
            const forceY = randomFloat(0.001, 0.02)
            const forceZ = randomFloat(0.001, 0.02)
            electron.position.x = 0
            electron.position.y = 0
            electron.position.z = 0
            electron.scale.set(scale, scale, scale)

            parent.forceX = forceX
            parent.forceY = forceY
            parent.forceZ = forceZ
            parent.initForceX = forceX
            parent.initForceY = forceY
            parent.initForceZ = forceZ

            parent.radius = 0
            parent.initRadius = radius

            parent.fq = randomInt(0, 100)

            parent.rotation.x = THREE.MathUtils.degToRad(randomInt(0, 360))
            parent.rotation.y = THREE.MathUtils.degToRad(randomInt(0, 360))
            parent.rotation.z = THREE.MathUtils.degToRad(randomInt(0, 360))

            parent.add(electron)
            this.object3D.add(parent)
            this.electrons.push(parent)
        }
    }

    render(now) {
        if (!this.canRender) return
        this.centerMesh.position.y = ((Math.sin(now / 500) + 1) / 2) * 3

        if (this.isReset) return

        for (let i = 0; i < this.electrons.length; i++) {
            const elec = this.electrons[i]
            elec.rotation.x += Math.min(elec.forceX, 0.06)
            elec.rotation.y += Math.min(elec.forceY, 0.06)
            elec.rotation.z += Math.min(elec.forceZ, 0.06)

            const radiusIntv = this.radiusIntv
            const radius = ((Math.sin(now / 500 + elec.fq) + 1) / 2) * radiusIntv

            elec.children[0].position.x = elec.radius + radius
            elec.children[0].position.y = elec.radius + radius
            elec.children[0].position.z = elec.radius + radius
        }

        // this.materials[1].uniforms.uFract.value = ((Math.sin(now / 750) + 1) / 2) * 0.7 + 0.15
    }

    expand() {
        this.tlShrink ? .kill()
        this.tlShrink = null
        if (this.tlExpand ? .isActive()) return
        this.tlExpand ? .kill()
        const tl = new TimelineLite()
        // console.log('expand go')

        const duration = 2
        const forceIncrease = 0.025
        for (let i = 0; i < this.electrons.length; i++) {
            const elec = this.electrons[i]
            const obj = {
                value: elec.radius,
            }

            tl.to(
                obj, {
                    value: 12,
                    duration,
                    ease: 'expo.out',
                    onUpdate: () => {
                        elec.radius = obj.value
                    },
                },
                0,
            )

            const obj2 = {
                forceX: elec.forceX,
                forceY: elec.forceY,
                forceZ: elec.forceZ,
            }

            tl.to(
                obj2, {
                    forceX: elec.forceX + forceIncrease,
                    forceY: elec.forceY + forceIncrease,
                    forceZ: elec.forceZ + forceIncrease,
                    duration: duration - 0.5,
                    ease: 'expo.out',
                    onUpdate: () => {
                        elec.forceX = obj2.forceX
                        elec.forceY = obj2.forceY
                        elec.forceZ = obj2.forceZ
                    },
                },
                0,
            )
        }

        this.tlExpand = tl
        this.expanded = true
    }

    shrink() {
        this.tlExpand ? .kill()
        this.tlExpand = null
        if (this.tlShrink ? .isActive() || (!this.isFadedIn && !this.isTriggered)) return
        if (!this.expanded) return
        this.tlShrink ? .kill()
        const tl = new TimelineLite()

        const duration = 2
        for (let i = 0; i < this.electrons.length; i++) {
            const elec = this.electrons[i]
            const obj = {
                value: elec.radius,
            }

            tl.to(
                obj, {
                    value: elec.initRadius,
                    duration,
                    ease: 'expo.out',
                    onUpdate: () => {
                        elec.radius = obj.value
                    },
                },
                0,
            )

            const obj2 = {
                forceX: elec.forceX,
                forceY: elec.forceY,
                forceZ: elec.forceZ,
            }

            tl.to(
                obj2, {
                    forceX: elec.initForceX,
                    forceY: elec.initForceY,
                    forceZ: elec.initForceZ,
                    duration,
                    ease: 'expo.out',
                    onUpdate: () => {
                        elec.forceX = obj2.forceX
                        elec.forceY = obj2.forceY
                        elec.forceZ = obj2.forceZ
                    },
                },
                0,
            )
        }

        this.tlShrink = tl
        this.expanded = false
    }

    fadeIn() {
        this.canRender = true
        if (this.isFadedIn) return
        const delay = 0.2
        const tl = new TimelineLite({
            delay
        })
        this.tlFadeIn = tl
        super.fadeIn()
        this.object3D.visible = true
        const duration = 1.4
        this.centerMesh.material.opacity = 0

        this.radiusIntv = 0
        const objRadiusIntv = {
            value: 0,
        }
        TweenLite.to(objRadiusIntv, {
            value: 2,
            duration,
            ease: 'linear',
            onUpdate: () => {
                this.radiusIntv = objRadiusIntv.value
            },
        })

        const objScale = {
            value: 0.0001,
        }
        TweenLite.to(objScale, {
            value: 1,
            duration: 1.8,
            ease: 'expo.out',
            onUpdate: () => {
                const s = objScale.value * this.centerScale
                this.centerMesh.scale.set(s, s, s)
            },
        })

        for (let i = 0; i < this.electrons.length; i++) {
            const elec = this.electrons[i]
            elec.radius = 0
            const obj = {
                value: 0,
            }

            tl.to(
                obj, {
                    value: elec.initRadius,
                    duration,
                    ease: 'quart.out',
                    onUpdate: () => {
                        elec.radius = obj.value
                    },
                },
                0,
            )
        }
    }

    click(mesh) {
        if (mesh.isScaling) return
        mesh.isScaling = true
        SoundManager.trigger(SOUNDS_CONST.CLICK)
        const tl = new TimelineLite()

        const scale = {
            value: 1,
        }

        tl.to(scale, {
            value: 0.7,
            duration: 0.5,
            ease: 'expo.out',
            onUpdate: () => {
                const s = scale.value * this.centerScale
                this.centerMesh.scale.set(s, s, s)
            },
        })

        tl.to(
            scale, {
                duration: 1.4,
                value: 1,
                ease: 'bounce.out',
                onUpdate: () => {
                    const s = scale.value * this.centerScale
                    this.centerMesh.scale.set(s, s, s)
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
        const tl = new TimelineLite({
            onComplete: () => {},
        })
        const initX = this.object3D.position.x
        const initZ = this.object3D.position.z

        const vec3 = new THREE.Vector3()
        vec3.subVectors(this.object3D.position, this.centerRoad).normalize()

        const scalar = -30

        tl.to(this.object3D.position, {
            x: initX + vec3.x * scalar,
            z: initZ + vec3.z * scalar,
            duration: 1,
            ease: 'quart',
        })

        this.tlTriggered = tl
    }

    reset() {
        this.canRender = false
        if (this.isReset) return
        super.reset()

        this.tlTriggered ? .kill()
        this.tlTriggered = null
        this.tlFadeIn ? .kill()
        this.tlFadeIn = null
        this.tlShrink ? .kill()
        this.tlShrink = null
        this.tlExpand ? .kill()
        this.tlExpand = null

        const objRadiusIntv = {
            value: this.centerScale,
        }
        const duration = 0.6

        TweenLite.to(objRadiusIntv, {
            value: 0,
            duration,
            ease: 'linear',
            onUpdate: () => {
                const s = objRadiusIntv.value
                this.centerMesh.scale.set(s, s, s)
            },
        })

        this.object3D.position.copy(this.position)
        this.object3D.position.y += 8

        for (let i = 0; i < this.electrons.length; i++) {
            const parent = this.electrons[i]

            parent.radius = 0

            parent.children[0].position.x = 0
            parent.children[0].position.y = 0
            parent.children[0].position.z = 0
        }

        this.object3D.visible = false
    }
}