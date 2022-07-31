import {
    DisplacementShader
} from './DisplacementShader'
import LoaderManager from '~managers/LoaderManager'
import ResizeManager from '~managers/ResizeManager'
import {
    Vector2,
    RepeatWrapping,
    Color
} from 'three'
import {
    WINDOW_RESIZE,
    GO_TO_PROJECT,
    BACK_ON_ROAD,
    COLORS_PROJECT,
    COLORS_LAB,
    COLORS_ABOUT
} from '~constants/'
import {
    ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js'
import {
    TimelineLite,
    TweenLite
} from 'gsap/gsap-core'
// import GUI from '../Gui'
import {
    DELAY_MENU_TO_PROJECT,
    GO_TO_MENU_FROM_PROJECT
} from '../../constants'

const BG_COLORS = [COLORS_PROJECT[0], COLORS_LAB[0], COLORS_ABOUT[0]]

export default class ProjectPostProcessing {
    used = false
    maxForce = 9
    constructor() {
        const {
            texture
        } = LoaderManager.subjects.displacement
        texture.wrapS = texture.wrapT = RepeatWrapping
        texture.center.set(0.5, 0.5)
        this.pass = new ShaderPass(DisplacementShader)
        this.pass.material.uniforms.uDisplaceMap.value = texture
        this.pass.material.uniforms.uResolution.value = new Vector2(ResizeManager.width, ResizeManager.height)
        this.pass.material.uniforms.uBgColor.value = new Color(
            BG_COLORS[0].r / 255,
            BG_COLORS[0].g / 255,
            BG_COLORS[0].b / 255,
        )

        this.texture = texture

        this.events()
        this.initGUI()
        this.pass.material.uniforms.uLighten.value = this.guiController.uLighten
    }

    initGUI() {
        // gui
        this.guiController = {
            ppForce: 9.0,
            uLighten: 0.62,
        }
        // const folder = GUI.addFolder('PP')
        // folder.open()

        // folder
        //   .add(this.guiController, 'ppForce', 0, 100)
        //   .step(0.1)
        //   .name('ppForce')
        //   .onChange(this.guiChange)

        // folder
        //   .add(this.guiController, 'uLighten', 0, 1)
        //   .step(0.01)
        //   .name('ppForce')
        //   .onChange(this.guiChange)
    }

    // guiChange = () => {
    //   this.pass.material.uniforms.uForce.value = this.guiController.ppForce
    //   this.pass.material.uniforms.uLighten.value = this.guiController.uLighten
    // }

    events() {
        window.addEventListener(WINDOW_RESIZE, this.handleResize, {
            passive: true
        })
        window.addEventListener(GO_TO_PROJECT, e => {
            const {
                directionCenter,
                fromMenuView
            } = e.detail
            this.transitionIn(directionCenter, fromMenuView)
        })
        window.addEventListener(BACK_ON_ROAD, () => this.transitionOut())
        window.addEventListener(GO_TO_MENU_FROM_PROJECT, () => this.transitionOut(true))
    }

    transitionIn = (direction, fromMenuView) => {
        this.pass.material.uniforms.uDirection.value = -direction

        this.tlBackOnRoad ? .kill()
        this.used = true
        const duration = 1.4
        const delay = fromMenuView ? DELAY_MENU_TO_PROJECT : 0
        TweenLite.fromTo(
            this.pass.material.uniforms.uProgressSide, {
                value: 0
            }, {
                value: 1.0,
                duration,
                ease: 'expo.out',
                delay,
            },
        )

        TweenLite.fromTo(
            this.pass.material.uniforms.uForce, {
                value: 0
            }, {
                value: this.maxForce,
                duration,
                ease: 'linear',
                delay,
            },
        )

        TweenLite.fromTo(
            this.pass.material.uniforms.uAccelerate, {
                value: 1
            }, {
                value: 0,
                duration: duration + 0.5,
                ease: 'expo.out',
                delay,
            },
        )
    }

    transitionOut = (toMenu = false) => {
        const duration = 1.4
        const delay = toMenu ? DELAY_MENU_TO_PROJECT - 0.5 : 0
        this.tlBackOnRoad = new TimelineLite()
        this.tlBackOnRoad.to(
            this.pass.material.uniforms.uProgressSide, {
                value: 0.0,
                duration,
                ease: 'expo.out',
            },
            delay,
        )

        this.tlBackOnRoad.to(
            this.pass.material.uniforms.uForce, {
                value: 0.0,
                duration,
                ease: 'linear',
                onComplete: () => {
                    this.used = false
                },
            },
            delay,
        )

        this.tlBackOnRoad.to(
            this.pass.material.uniforms.uAccelerate, {
                value: 0,
                duration: 1,
                ease: 'expo.out',
            },
            delay,
        )
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
                const color = new Color(currentColor.r / 255, currentColor.g / 255, currentColor.b / 255)

                this.pass.material.uniforms.uBgColor.value = color
            },
        })
    }

    render(deltaTime) {
        this.pass.material.uniforms.uTime.value += deltaTime
    }

    handleResize = () => {
        this.pass.material.uniforms.uResolution.value = new Vector2(ResizeManager.width, ResizeManager.height)
    }
}