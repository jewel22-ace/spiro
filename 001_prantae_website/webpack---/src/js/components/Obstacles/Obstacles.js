// import * as THREE from 'three'

import Boxes from './Boxes/Boxes'
import Electrons from './Electrons/Electrons'
import Material from './Material'
import ScrollManager from '~managers/ScrollManager'
import {
    RAF,
    SCROLL,
    COLORS_PROJECT,
    COLORS_LAB,
    COLORS_ABOUT,
    GO_TO_PROJECT,
    BACK_ON_ROAD
} from '~constants/'
import RaycasterManager from '~managers/RaycasterManager'
import {
    TweenLite
} from 'gsap/gsap-core'
import Columns from './Columns/Columns'

const BG_COLORS = [COLORS_PROJECT[0], COLORS_LAB[0], COLORS_ABOUT[0]]

const PROGRESS_OBSC = []
const START = 0.17
const INC = 0.13
for (let i = 0; i < 6; i++) {
    PROGRESS_OBSC.push(START + i * INC)
}

export default class Obstacles {
    items = []
    canRender = true
    nbOverableItems = 0

    constructor(scene) {
        this.initMaterials()

        // create obstacles
        const electrons1 = new Electrons(
            [this.materialElectronGrain.material, this.materialElectronPattern.material, this.materialElectronPlain.material],
            PROGRESS_OBSC[0],
            0,
        )
        scene.add(electrons1.object3D)

        const columns1 = new Columns(this.materialElectronGrain.material, PROGRESS_OBSC[1], 0)
        scene.add(columns1.object3D)

        const box1 = new Boxes(this.materialBox.material, PROGRESS_OBSC[2], 0)
        scene.add(box1.object3D)

        const electrons2 = new Electrons(
            [this.materialElectronGrain.material, this.materialElectronPattern.material, this.materialElectronPlain.material],
            PROGRESS_OBSC[3],
            1,
        )
        scene.add(electrons2.object3D)

        const columns2 = new Columns(this.materialElectronGrain.material, PROGRESS_OBSC[4], 1)
        scene.add(columns2.object3D)

        const box2 = new Boxes(this.materialBox.material, PROGRESS_OBSC[5], 1)
        scene.add(box2.object3D)

        this.items.push(electrons1)
        this.items.push(electrons2)
        this.items.push(box1)
        this.items.push(box2)
        this.items.push(columns1)
        this.items.push(columns2)

        RaycasterManager.addObstacles([electrons1, electrons2], [box1, box2], [columns1, columns2])

        window.addEventListener(RAF, this.handleRAF)
        window.addEventListener(SCROLL, this.handleScroll)
        window.addEventListener(GO_TO_PROJECT, this.disable)
        window.addEventListener(BACK_ON_ROAD, this.enable)
        document.body.addEventListener('click', this.handleClick)
    }

    disable = () => {
        this.items.forEach(el => {
            el.object3D.visible = false
        })
        this.canRender = false
    }

    enable = () => {
        this.items.forEach(el => {
            if (el.isFadedIn || el.isTriggered) {
                el.object3D.visible = true
            }
        })
        this.canRender = true
    }

    initMaterials() {
        this.materialBox = new Material({
            uLightIntensity: 1.2,
            uNoiseCoef: 2.6,
            uNoiseMin: 0.76,
            uNoiseMax: 22.09,
            uAlpha: false,
            uFract: 2.0,
            index: 1,
        })

        this.materialElectronGrain = new Material({
            uLightIntensity: 1.6,
            uNoiseCoef: 1.4,
            uNoiseMin: 0.76,
            uNoiseMax: 22.09,
            uAlpha: false,
            uFract: 2.0,
            index: 0,
        })

        this.materialElectronPattern = new Material({
            uLightIntensity: 2,
            uNoiseCoef: 1.4,
            uNoiseMin: 0.76,
            uNoiseMax: 22.09,
            uAlpha: false,
            uFract: 0.23,
            uPattern: true,
            index: 4,
        })

        this.materialElectronPlain = new Material({
            uLightIntensity: 1.2,
            uNoiseCoef: 1.4,
            uNoiseMin: 0.76,
            uNoiseMax: 22.09,
            uAlpha: false,
            uFract: 2.0,
            uPlain: true,
            index: 3,
        })
    }

    handleRAF = e => {
        if (!this.canRender) return
        // this.box.render()
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            if (typeof item.render === 'function') {
                item.render(e.detail.now)
            }
        }

        if (this.nbOverableItems > 0) {
            this.hoverObjects()
        }
    }

    handleScroll = () => {
        // if (ScrollManager.progress > this.boxScrollValue - 0.035) {
        //   this.box.splitUp()
        // }
        const marginFadeIn = 0.09
        const marginTrigger = 0.035
        const marginFar = 0.03
        const marginBehind = 0.02

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            const marginFarOffset = item.columns ? 0.03 : 0
            const marginBehindOffset = item.columns ? 0.03 : 0
            if (
                ScrollManager.progress + marginFadeIn < item.scrollValue ||
                ScrollManager.progress - item.scrollValue > marginBehind + marginBehindOffset
            ) {
                if (!item.isReset) {
                    item.reset()
                    if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) {
                        RaycasterManager.updateObserver({})
                        this.nbOverableItems -= 1
                    }
                }
            } else if (
                ScrollManager.progress + marginFadeIn > item.scrollValue &&
                ScrollManager.progress + marginTrigger < item.scrollValue &&
                item.isReset
            ) {
                if (!item.isFadedIn) {
                    item.fadeIn()
                    if (i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) {
                        RaycasterManager.updateObserver({})
                        this.nbOverableItems += 1
                    }
                }
            } else if (
                ScrollManager.progress + marginTrigger > item.scrollValue &&
                ScrollManager.progress - item.scrollValue < marginFar + marginFarOffset &&
                item.isFadedIn
            ) {
                item.triggered()
            }
        }
    }

    showAll() {
        this.nbOverableItems = 0
        this.canRender = true
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            item.fadeIn()
        }
        RaycasterManager.updateObserver({})
    }

    hideAll() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            item.reset()
        }
        RaycasterManager.updateObserver({})
        this.nbOverableItems = 0
    }

    hoverObjects() {
        if (RaycasterManager.isReady) {
            const {
                intersects
            } = RaycasterManager
            if (intersects.length) {
                for (let i = 0; i < intersects.length; i++) {
                    const el = intersects[i]
                    if (el.object.name === 'electronCenter_0') {
                        this.obstacleHovered = this.items[0]
                        this.items[0].expand()
                    } else if (el.object.name === 'electronCenter_1') {
                        this.obstacleHovered = this.items[1]
                        this.items[1].expand()
                    } else if (el.object.name === 'obstacle_box_0') {
                        this.obstacleHovered = this.items[2]
                    } else if (el.object.name === 'obstacle_box_1') {
                        this.obstacleHovered = this.items[3]
                    } else if (el.object.name.includes('obstacle_column_0')) {
                        this.obstacleHovered = this.items[4]
                    } else if (el.object.name.includes('obstacle_column_1')) {
                        this.obstacleHovered = this.items[5]
                    }

                    this.meshHovered = el.object
                }
            } else {
                this.obstacleHovered = null
                this.meshHovered = null
                this.items[0].shrink()
                this.items[1].shrink()
            }
        }
    }

    handleClick = () => {
        if (this.obstacleHovered) {
            this.obstacleHovered.click(this.meshHovered)
        }
    }

    transitionToColor(currentIndex, nextIndex) {
        const duration = 2
        const currentColor = { ...BG_COLORS[currentIndex]
        }
        const targetColor = { ...BG_COLORS[nextIndex]
        }

        TweenLite.to(currentColor, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'expo.out',
            duration,
            onUpdate: () => {
                const color = new THREE.Color(currentColor.r / 255, currentColor.g / 255, currentColor.b / 255)
                this.materialBox.material.uniforms.uBgColor.value = color
                this.materialElectronGrain.material.uniforms.uBgColor.value = color
                this.materialElectronPattern.material.uniforms.uBgColor.value = color
                this.materialElectronPlain.material.uniforms.uBgColor.value = color
            },
        })
    }
}