import Light from './Light'
import LinesManager from '~managers/LinesManager'
import ResizeManager from '~managers/ResizeManager'
import glsl from 'glslify'
// import GUI from '../Gui'
import vertexShader from './grain.vert'
import fragmentShader from './grain.frag'
import {
    FrontSide,
    Color,
    Vector2,
    RawShaderMaterial
} from 'three'
import {
    COLORS_PROJECT,
    COLORS_LAB,
    COLORS_ABOUT
} from '~constants/'

const BG_COLORS = [COLORS_PROJECT[0], COLORS_LAB[0], COLORS_ABOUT[0]]

export default class Material {
    uniforms = {}
    lights = []
    guiController = {
        uLightIntensity: 2,
        uNoiseCoef: 3.3,
        uNoiseMin: 0.76,
        uNoiseMax: 22.09,
        uAlpha: false,
        uFract: 2.0,
    }

    constructor(params) {
        this.indexColor = 0
        this.currentColor = BG_COLORS[this.indexColor]
        this.guiController = params
        this.initLights()
        this.init()

        // if (params.index === 0) {
        //   this.initGUI()
        // }
    }

    initLights() {
        const lightY = 80
        for (let i = 0; i < LinesManager.circleCenters.length; i++) {
            const position = LinesManager.circleCenters[i]
            position.y += lightY
            const light = new Light(position)
            // scene.add(light)
            this.lights.push(light)
        }
    }

    init() {
        this.uniforms = {
            uLightPos: {
                value: [this.lights[0].position, this.lights[1].position, this.lights[2].position], // array of vec3
            },
            uLightColor: {
                value: [new Color(0xffffff), new Color(0xffffff), new Color(0xffffff)], // color
            },
            uLightIntensity: {
                value: this.guiController.uLightIntensity,
            },
            uNoiseCoef: {
                value: this.guiController.uNoiseCoef,
            },
            uNoiseMin: {
                value: this.guiController.uNoiseMin,
            },
            uNoiseMax: {
                value: this.guiController.uNoiseMax,
            },
            uBgColor: {
                value: new Color(this.currentColor.r / 255, this.currentColor.g / 255, this.currentColor.b / 255),
            },
            uColor: {
                value: new Color(0x555555),
            },
            uAlpha: {
                value: this.guiController.uAlpha,
            },
            uTime: {
                value: 1.0,
            },
            uFract: {
                value: this.guiController.uFract,
            },
            uResolution: {
                value: new Vector2(ResizeManager.width / 40, ResizeManager.height / 40),
            },
            uPattern: {
                value: this.guiController.uPattern,
            },
            uPlain: {
                value: this.guiController.uPlain,
            },
        }

        this.material = new RawShaderMaterial({
            vertexShader: glsl(vertexShader),
            fragmentShader: glsl(fragmentShader),
            uniforms: this.uniforms,
            side: FrontSide,
            transparent: true,
        })
    }

    // initGUI() {
    //   const folder = GUI.addFolder('Grain')

    //   folder
    //     .add(this.guiController, 'uLightIntensity', 0, 8)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uNoiseCoef', 0, 40)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uNoiseMin', 0.0, 10.0)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uNoiseMax', 1.0, 100.0)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uFract', 0.0, 10.0)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder.add(this.guiController, 'uAlpha').onChange(this.guiChange)
    //   // folder.open()
    // }

    // guiChange = () => {
    //   this.uniforms.uLightIntensity.value = this.guiController.uLightIntensity
    //   this.uniforms.uNoiseCoef.value = this.guiController.uNoiseCoef
    //   this.uniforms.uNoiseMin.value = this.guiController.uNoiseMin
    //   this.uniforms.uNoiseMax.value = this.guiController.uNoiseMax
    //   this.uniforms.uAlpha.value = this.guiController.uAlpha
    //   this.uniforms.uFract.value = this.guiController.uFract
    // }
}