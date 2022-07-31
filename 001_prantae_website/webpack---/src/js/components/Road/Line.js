// import * as THREE from 'three'
import {
    MeshLine,
    MeshLineMaterial
} from 'three.meshline'
import {
    SWITCH_VIEW,
    COLORS_PROJECT,
    COLORS_LAB,
    COLORS_ABOUT,
    TRANSITION_MENU_MAX_DURATION,
    DELAY_INTRO_START_CAMERA,
    OVERVIEW_TYPE,
    LISTVIEW_TYPE,
    INTRO_TYPE,
} from '../../constants'
import {
    randomFloat,
    randomInt
} from '../../utils/math'
import {
    TimelineLite
} from 'gsap'
import ScrollManager from '../../managers/ScrollManager'

export const BG_COLORS = [COLORS_PROJECT[0], COLORS_LAB[0], COLORS_ABOUT[0]]

export const MATERIAL = new MeshLineMaterial({
    color: new THREE.Color(`rgb(${COLORS_PROJECT[0].r}, ${COLORS_PROJECT[0].g}, ${COLORS_PROJECT[0].b})`),
    transparent: true,
    opacity: 0.8,
    lineWidth: 1.5,
})

const INC_RAF = 18

export default class Line {
    progress = 1
    nbPoints = 200 // lengt of line
    constructor(extraPoints, index, progress = 1) {
        this.extraPoints = extraPoints
        this.index = index
        this.speedCoef = randomFloat(0.00001, 0.0001)
        this.offset = -randomFloat(0, 5) / 100
        this.progress = progress
        this.progress += this.offset
        this.nbPoints = randomInt(120, 160)

        // extraPoints.forEach((p, index) => {
        //   const offset = noise2D(p.x, p.z) * 5
        //   // console.log(offset)
        //   p.x += offset
        //   p.z += offset
        //   // if (index % 10 === 0) {
        //   // }
        // })

        this.trail = new THREE.CatmullRomCurve3(extraPoints)
        this.init()

        this.mesh = new THREE.Mesh(this.trailLine, MATERIAL)
        // this.mesh.material.depthTest = false
        // this.mesh.material.depthWrite = false
        // this.mesh.renderOrder = 1
        this.mesh.visible = false

        window.addEventListener(SWITCH_VIEW, this.switchView)
    }

    init() {
        const points = []

        for (let i = 0; i < this.nbPoints; i++) {
            const point = this.trail.getPoint(this.progress)
            points.push(point)
        }

        this.trailLine = new MeshLine()
        // this.trailLine.frustumCulled = false
        this.trailLine.setPoints(points, p => p)
        setTimeout(() => {
            this.isReady = true
        }, 1000)
    }

    render(deltaTime) {
        if (!this.isReady) return
        // if (this.index === 0) {
        const position = this.trail.getPoint(this.progress)
        this.trailLine.advance(position)
        this.progress += INC_RAF * this.speedCoef
        // }
    }

    reset() {
        this.isReady = false
        this.init()
    }

    switchView = e => {
        const {
            type
        } = e.detail
        this.tlSwitchView ? .kill()
        this.tlSwitchView = new TimelineLite()
        if (type === OVERVIEW_TYPE || type === LISTVIEW_TYPE) {
            this.mesh.visible = true

            switch (ScrollManager.index) {
                default: MATERIAL.color = new THREE.Color(
                    `rgb(${COLORS_PROJECT[0].r}, ${COLORS_PROJECT[0].g}, ${COLORS_PROJECT[0].b})`,
                )
                break
                case 1:
                        MATERIAL.color = new THREE.Color(`rgb(${COLORS_LAB[0].r}, ${COLORS_LAB[0].g}, ${COLORS_LAB[0].b})`)
                    break
                case 2:
                        MATERIAL.color = new THREE.Color(`rgb(${COLORS_ABOUT[0].r}, ${COLORS_ABOUT[0].g}, ${COLORS_ABOUT[0].b})`)
                    break
            }
            const duration = TRANSITION_MENU_MAX_DURATION
            this.tlSwitchView.to(this.mesh.material, {
                opacity: 1,
                duration: 1.5,
                ease: 'linear',
                delay: TRANSITION_MENU_MAX_DURATION - 0.5,
            })
        } else if (type === INTRO_TYPE) {
            this.mesh.visible = true
            this.tlSwitchView = new TimelineLite({
                onComplete: () => {
                    this.mesh.visible = false
                },
                delay: DELAY_INTRO_START_CAMERA,
            })

            const duration = 1.5
            this.tlSwitchView.fromTo(
                this.mesh.material, {
                    opacity: 1,
                }, {
                    opacity: 0,
                    duration,
                    ease: 'linear',
                },
            )
        } else {
            this.tlSwitchView = new TimelineLite({
                onComplete: () => {
                    this.mesh.visible = false
                },
            })
            const duration = 1
            this.tlSwitchView.to(this.mesh.material, {
                opacity: 0,
                duration,
                ease: 'linear',
            })
        }
    }
}