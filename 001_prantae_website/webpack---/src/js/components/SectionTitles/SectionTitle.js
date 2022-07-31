// import * as THREE from 'three'
import LoaderManager from '~managers/LoaderManager'
import vertexShader from './sectionTitle.vert'
import fragmentShader from './sectionTitle.frag'
import glsl from 'glslify'
// import GUI from '../Gui'
import {
    TimelineLite
} from 'gsap/gsap-core'
import {
    COLORS_PROJECT,
    COLORS_LAB,
    COLORS_ABOUT
} from '~constants/'

const TITLES = ['PROJECTS', 'LAB', 'ABOUT']
const COLORS = [COLORS_PROJECT, COLORS_LAB, COLORS_ABOUT]

// BMFONTS
import createGeometry from 'three-bmfont-text'
import MSDFShader from 'three-bmfont-text/shaders/msdf'

export default class SectionTitle {
    guiController = {
        uProgress: 0,
        uProgressY: 0,
        uZoom: 0.28,
    }

    index = 0

    constructor(index = 0) {
        this.index = index
        let font = LoaderManager.subjects.ibmplexsans.bmfont

        // Create a geometry of packed bitmap glyphs
        const geometry = createGeometry({
            font,
            text: TITLES[index],
            width: 100000,
            lineHeight: 1,
            letterSpacing: 5,
        })

        // set index for each vertices
        const indexes = []
        const {
            count
        } = geometry.attributes.position
        for (let i = 0; i < count; i++) {
            // 1 character is 4 vertices
            indexes.push(1 + Math.floor(i / 4))
        }
        // console.log(indexes)
        geometry.setAttribute('indexChar', new THREE.Float32BufferAttribute(indexes, 1))

        geometry.computeBoundingBox()
        // geometry.center()
        // console.log(geometry)

        // if (index === 0) {
        //   this.initGUI()
        // }

        const material = this.initMaterial(geometry)

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.scale.set(1, -1, 1)
    }

    // initGUI() {
    //   const folder = GUI.addFolder('Grain Text')
    //   folder
    //     .add(this.guiController, 'uProgress', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uProgressY', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uZoom', 0, 30)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   // folder.open()
    // }

    initMaterial(geometry) {
        this.uniforms = {
            map: {
                value: LoaderManager.subjects.ibmplexsans_glyph.texture
            },
            opacity: {
                value: 1
            },
            uNbChars: {
                value: geometry.layout.glyphs.length
            },
            uHeight: {
                value: geometry.layout.height,
            },
            uReverse: {
                value: false,
            },
            uProgress: {
                value: this.guiController.uProgress,
            },
            uProgressY: {
                value: this.guiController.uProgressY,
            },
            uSize: {
                value: new THREE.Vector2(geometry.boundingBox.max.x, geometry.boundingBox.max.y),
            },
            uColor: {
                value: new THREE.Color(
                    `rgb(${COLORS[this.index][0].r}, ${COLORS[this.index][0].g}, ${COLORS[this.index][0].b})`,
                ), // 0x434343 // 'rgb(172, 200, 255)'
            },
            uZoom: {
                value: this.guiController.uZoom,
            },
        }

        const material = new THREE.RawShaderMaterial(
            MSDFShader({
                vertexShader: glsl(vertexShader),
                fragmentShader: glsl(fragmentShader),
                side: THREE.DoubleSide,
                transparent: true,
                negate: false,
                uniforms: this.uniforms,
            }),
        )

        return material
    }

    animate() {
        // return
        const durationY = 1.2
        const duration = 2.3
        const durationPause = 1.5
        this.tl ? .kill()
        this.tl = new TimelineLite({
            repeat: 0
        })

        this.uniforms.uReverse.value = false
        this.uniforms.uProgress.value = 0
        this.uniforms.uProgressY.value = 0

        this.tl.add(() => {
            this.uniforms.uReverse.value = false
        })

        this.tl.fromTo(
            this.uniforms.uProgressY, {
                value: 0,
            }, {
                duration: durationY,
                ease: 'quart.out',
                value: 1,
            },
            'animIn',
        )

        this.tl.fromTo(
            this.uniforms.uProgress, {
                value: 0,
            }, {
                duration,
                ease: 'quart.out',
                value: 1,
            },
            'animIn',
        )

        this.tl.add(() => {
            this.uniforms.uReverse.value = true
            this.uniforms.uProgress.value = 0
            this.uniforms.uProgressY.value = 0
        }, `animIn+=${durationPause}`)

        this.tl.fromTo(
            this.uniforms.uProgress, {
                value: 0,
            }, {
                duration,
                ease: 'quart.out',
                value: 1,
            },
            `animIn+=${durationPause}`,
        )

        this.tl.fromTo(
            this.uniforms.uProgressY, {
                value: 0,
            }, {
                duration: durationY,
                ease: 'quart.out',
                value: 1,
            },
            `animIn+=${durationPause}`,
        )

        // tl.pause()
    }

    kill() {
        this.tl ? .kill()
        // this.uniforms.uReverse.value = true
        // const tl = new TimelineLite()
        this.uniforms.uReverse.value = false
        this.uniforms.uProgress.value = 0
        this.uniforms.uProgressY.value = 0

        // tl.set(this.uniforms.uProgress, {
        //   value: 1,
        // })

        // tl.set(this.uniforms.uProgressY, {
        //   value: 1,
        // })
    }

    // guiChange = () => {
    //   this.uniforms.uZoom.value = this.guiController.uZoom
    //   this.uniforms.uProgress.value = this.guiController.uProgress
    //   this.uniforms.uProgressY.value = this.guiController.uProgressY
    // }
}