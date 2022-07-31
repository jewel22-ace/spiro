// import * as THREE from 'three'
import vertexShader from './gradient.vert'
import fragmentShader from './gradient.frag'
import glsl from 'glslify'
// import GUI from '../Gui'
import {
    TweenLite
} from 'gsap'
import {
    COLORS_LAB,
    COLORS_ABOUT
} from '~constants/'
import {
    MOUSE_MOVE
} from '../../constants'
import {
    lerp
} from '../../utils/math'

const COLORS_PROJECT_2 = [{
        r: 116,
        g: 156,
        b: 255
    },
    {
        r: 120,
        g: 173,
        b: 255
    },
]

const COLORS = [COLORS_PROJECT_2, COLORS_LAB, COLORS_ABOUT]
const FREQUENCE = 4000
const LERP_FORCE = 0.08

export default class GradientTexture {
    guiController = {
        uP1x: 0.7,
        uP1y: 0.32,
        uColorP0: COLORS[0][0],
        uColorP1: COLORS[0][1],
        uNoise: 0.87,
        uMaxColor: 0.75,
        uMinColor: 0.5,

        // LAB
        // {r:255,g:190,b:134}
        // {r:252,g:219,b:178}

        // ABOUT
        // {r:192,g:255,b:177}
        // {r^fzz:222,g:255,b:220}
    }
    mouseX = 0.5
    mouseXTarget = 0.5
    mouseY = 0.5
    mouseYTarget = 0.5

    constructor() {
        this.width = 1024 // ResizeManager.width / 6
        this.height = 1024 // ResizeManager.height / 6

        this.rTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            depthBuffer: false,
            stencilBuffer: false,
        })

        // this.initGUI()
        this.initPlane()

        window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
    }

    // initGUI() {
    //   const folder = GUI.addFolder('Gradient')

    //   folder
    //     .add(this.guiController, 'uP1x', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uP1y', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder.addColor(this.guiController, 'uColorP0').onChange(this.guiChange)

    //   folder.addColor(this.guiController, 'uColorP1').onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uNoise', 0, 1000)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uMaxColor', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uMinColor', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder.open()
    // }

    // guiChange = () => {
    //   const { uP1, uColorP0, uColorP1, uNoise, uMaxColor, uMinColor } = this.material.uniforms

    //   uP1.value = new THREE.Vector2(this.guiController.uP1x, this.guiController.uP1y)
    //   uColorP0.value = new THREE.Color(
    //     this.guiController.uColorP0.r / 255,
    //     this.guiController.uColorP0.g / 255,
    //     this.guiController.uColorP0.b / 255,
    //   )
    //   uColorP1.value = new THREE.Color(
    //     this.guiController.uColorP1.r / 255,
    //     this.guiController.uColorP1.g / 255,
    //     this.guiController.uColorP1.b / 255,
    //   )

    //   uNoise.value = this.guiController.uNoise
    //   uMaxColor.value = this.guiController.uMaxColor
    //   uMinColor.value = this.guiController.uMinColor
    // }

    initPlane() {
        const plane = new THREE.PlaneGeometry(this.width, this.height)

        this.uniforms = {
            uResolution: {
                value: new THREE.Vector2(this.width, this.height),
            },
            uP1: {
                value: new THREE.Vector2(this.guiController.uP1x, this.guiController.uP1y),
            },
            uColorP0: {
                value: new THREE.Color(
                    this.guiController.uColorP0.r / 255,
                    this.guiController.uColorP0.g / 255,
                    this.guiController.uColorP0.b / 255,
                ),
            },
            uColorP1: {
                value: new THREE.Color(
                    this.guiController.uColorP1.r / 255,
                    this.guiController.uColorP1.g / 255,
                    this.guiController.uColorP1.b / 255,
                ),
            },
            uTime: {
                value: 0.0,
            },
            uMouseX: {
                value: 0.0,
            },
            uMouseY: {
                value: 0.0,
            },
            uNoise: {
                value: this.guiController.uNoise,
            },
            uMaxColor: {
                value: this.guiController.uMaxColor,
            },
            uMinColor: {
                value: this.guiController.uMinColor,
            },
        }

        this.material = new THREE.RawShaderMaterial({
            vertexShader: glsl(vertexShader),
            fragmentShader: glsl(fragmentShader),
            uniforms: this.uniforms,
        })

        const quad = new THREE.Mesh(plane, this.material)
        quad.position.z = -100

        this.camera = new THREE.OrthographicCamera(
            this.width / -2,
            this.width / 2,
            this.height / 2,
            this.height / -2, -10000,
            10000,
        )

        this.camera.position.z = 100

        this.scene = new THREE.Scene()
        this.scene.add(quad)
    }

    handleMouseMove = e => {
        const {
            x,
            y
        } = e.detail
        this.mouseXTarget = x / 2 + 1
        this.mouseYTarget = -y / 2 + 0.5
    }

    render(deltaTime) {
        this.material.uniforms.uTime.value += deltaTime / FREQUENCE

        this.mouseX = lerp(this.mouseX, this.mouseXTarget, LERP_FORCE)
        this.uniforms.uMouseX.value = this.mouseX

        this.mouseY = lerp(this.mouseY, this.mouseYTarget, LERP_FORCE)
        this.uniforms.uMouseY.value = this.mouseY
    }

    transitionToColor(currentIndex, nextIndex) {
        const duration = 2
        const currentColor = { ...COLORS[currentIndex][0]
        }
        const targetColor = { ...COLORS[nextIndex][0]
        }

        TweenLite.to(currentColor, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'expo.out',
            duration,
            onUpdate: () => {
                this.material.uniforms.uColorP0.value = new THREE.Color(
                    currentColor.r / 255,
                    currentColor.g / 255,
                    currentColor.b / 255,
                )
            },
        })

        const currentColor2 = { ...COLORS[currentIndex][1]
        }
        const targetColor2 = { ...COLORS[nextIndex][1]
        }

        TweenLite.to(currentColor2, {
            r: targetColor2.r,
            g: targetColor2.g,
            b: targetColor2.b,
            ease: 'expo.out',
            duration,
            onUpdate: () => {
                this.material.uniforms.uColorP1.value = new THREE.Color(
                    currentColor2.r / 255,
                    currentColor2.g / 255,
                    currentColor2.b / 255,
                )
            },
        })
    }
}