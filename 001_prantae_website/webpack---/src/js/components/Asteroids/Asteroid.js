import {
    TweenLite
} from 'gsap/gsap-core'
import LinesManager from '~managers/LinesManager'
import ScrollManager from '../../managers/ScrollManager'
import {
    randomFloat,
    randomInt
} from '../../utils/math'
import {
    SPHERE_GEOMETRY
} from '../Obstacles/Electrons/Electrons'

const marginFront = 0.12
const marginBehind = 0.01

export default class Asteroid {
    progress = 0
    object3D = new THREE.Object3D()
    objScales = []
    canRender = false
    scrollDetect = true
    constructor(materials, progress, position, index) {
        this.materials = materials
        this.progress = progress
        this.index = index

        this.mainPoints = LinesManager.mainRoad.points
        const offsetPos = 14
        let nb = randomInt(2, 4)
        if (index === 0 || index === 1) {
            nb = 4
        }
        for (let i = 0; i < nb; i++) {
            const mesh = new THREE.Mesh(SPHERE_GEOMETRY, this.materials[i % 3])
            const s = randomFloat(1, 2.5)
            mesh.position.x = index === 1 ? randomFloat(-offsetPos, 0) : randomFloat(-offsetPos, offsetPos)
            mesh.position.y = randomFloat(-offsetPos - 5, offsetPos - 5)
            mesh.position.z = index === 1 ? randomFloat(-offsetPos, 0) : randomFloat(-offsetPos, offsetPos)
            mesh.initScale = s
            mesh.scale.set(s, s, s)
            mesh.speed = randomFloat(0.4, 0.8)
            mesh.rangeY = randomFloat(3, 6)
            mesh.offset = randomFloat(1, 100)
            mesh.initY = mesh.position.y
            mesh.rangeX = randomFloat(1, 3)
            mesh.speedX = randomFloat(0.1, 0.3)
            mesh.initX = mesh.position.x
            this.object3D.add(mesh)
            this.objScales.push({
                value: 0.01
            })
        }

        this.object3D.position.copy(position)
        this.object3D.position.y += randomFloat(8, 12)
        this.canRender = false
        this.object3D.visible = false
    }

    render(now) {
        if (!this.scrollDetect) return

        if (ScrollManager.progress + marginFront > this.progress && ScrollManager.progress - this.progress < marginBehind) {
            if (!this.object3D.visible) {
                this.fadeIn()
            }
        } else if (this.object3D.visible) {
            this.fadeOut()
        }

        if (!this.canRender) return

        for (let i = 0; i < this.object3D.children.length; i++) {
            const mesh = this.object3D.children[i]
            mesh.position.y = mesh.initY + Math.sin(mesh.offset + now * mesh.speed) * mesh.rangeY
            mesh.position.x = mesh.initX + Math.sin(mesh.offset + now * mesh.speedX) * mesh.rangeX
            const s = this.objScales[i].value * mesh.initScale
            mesh.scale.set(s, s, s)
        }
    }

    fadeIn() {
        this.canRender = true
        if (this.isFadedIn) return
        this.isFadedIn = true
        this.object3D.visible = true

        TweenLite.fromTo(
            this.objScales, {
                value: 0.01
            }, {
                value: 1,
                duration: 1.5,
                ease: 'expo.out',
                stagger: 0.15,
                onComplete: () => {
                    this.isFadedIn = false
                },
            },
        )
    }

    fadeOut(menuView) {
        this.isFadedIn = false
        if (menuView) {
            this.scrollDetect = false
        }
        TweenLite.to(this.objScales, {
            value: 0.01,
            duration: 0.5,
            ease: 'expo.out',
            onComplete: () => {
                this.canRender = false
                this.object3D.visible = false
            },
        })
    }
}