import LoaderManager from '~managers/LoaderManager'
// import * as THREE from 'three'
import {
    degToRad
} from '~utils/three'
import {
    TimelineLite
} from 'gsap/gsap-core'

// BMFONTS
import createGeometry from 'three-bmfont-text'
import MSDFShader from 'three-bmfont-text/shaders/msdf'
import {
    DARK_GREY
} from '../../../constants'
import vertexShader from './title.vert'
import fragmentShader from './title.frag'
// import Gui from '../../Gui'

const MAX_OPACITY = 0.6
// let inc = 0
const OFFSET_Y_TITLE = 0.78
const OFFSET_Y_SUBTITLE = -2.86

export default class Title {
    offsetY = 4
    guiController = {
        y: 0.78,
    }

    constructor(context, type = 'title') {
        this.context = context
        const text = type === 'title' ? context.data.title : context.data.subtitle
        let font = LoaderManager.subjects.roadgeek.bmfont
        let material = new THREE.RawShaderMaterial(
            MSDFShader({
                vertexShader,
                fragmentShader,
                map: LoaderManager.subjects.roadgeek_glyph.texture, // font glyphs
                color: 0x000000, // We'll remove it later when defining the fragment shader
                side: THREE.BackSide,
                transparent: true,
                negate: false,
            }),
        )

        // if (inc === 1) {
        //   const folder = Gui.addFolder('Title')

        //   folder
        //     .add(this.guiController, 'y', -500, 500)
        //     .step(0.01)
        //     .onChange(this.guiChange)
        // }
        // inc++
        // console.log(material)
        let size = 0.08
        if (type === 'subtitle') {
            font = LoaderManager.subjects.alvar.bmfont
            material = new THREE.RawShaderMaterial(
                MSDFShader({
                    vertexShader,
                    fragmentShader,
                    map: LoaderManager.subjects.alvar_glyph.texture, // font glyphs
                    color: DARK_GREY, // We'll remove it later when defining the fragment shader
                    side: THREE.BackSide,
                    transparent: true,
                    negate: false,
                }),
            )
            size = 0.055
        }

        // Create a geometry of packed bitmap glyphs
        const geometry = createGeometry({
            font,
            text,
            width: 600,
            lineHeight: 1,
            // mode: 'nowrap',
        })

        geometry.computeBoundingBox()
        // geometry.center()

        let marginSide = 2 // geometry.layout.width
        // size = 1

        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(size, -size, size)
        mesh.index = context.index
        mesh.position.copy(context.stickHighestPoint)

        let correctVisualYOffset = 0
        if (context.directionCenter === 1) {
            correctVisualYOffset = 0.2
        }
        if (type === 'title') {
            mesh.position.y += OFFSET_Y_TITLE + correctVisualYOffset
        } else {
            mesh.position.y += OFFSET_Y_SUBTITLE + correctVisualYOffset
        }

        mesh.position.y += correctVisualYOffset

        mesh.lookAt(context.lookAt)
        // translate on left side
        if (context.directionCenter === 1) {
            marginSide += geometry.boundingBox.max.x * size
        }
        // apply side offset
        const vec3 = new THREE.Vector3()
        vec3.subVectors(context.lookAt, mesh.position).normalize()
        vec3.applyAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(-context.directionCenter * 90))
        vec3.multiplyScalar(marginSide)
        vec3.y = 0
        // console.log(text, vec3)
        mesh.position.add(vec3)

        context.object3d.add(mesh)

        this.mesh = mesh
        this.initY = this.mesh.position.y
    }

    // guiChange = () => {
    //   this.mesh.position.y = this.context.stickHighestPoint.y + this.guiController.y
    //   // this.mesh.position.y = this.context.stickHighestPoint
    // }

    fadeIn() {
        this.tlFadeOut ? .kill()
        this.mesh.position.y -= this.offsetY
        const duration = 1.2
        const durationOpacity = 1
        const tl = new TimelineLite()

        tl.to(
            this.mesh.position, {
                y: this.initY,
                ease: 'quart.out',
                duration,
            },
            0,
        )

        tl.to(
            this.mesh.material.uniforms.opacity, {
                value: MAX_OPACITY,
                ease: 'linear',
                duration: durationOpacity,
            },
            0,
        )

        this.tlFadeIn = tl
    }

    fadeOut() {
        this.tlFadeIn ? .kill()
        const duration = 0.5
        const tl = new TimelineLite()

        tl.to(
            this.mesh.material.uniforms.opacity, {
                value: 0,
                ease: 'linear',
                duration,
            },
            0,
        )

        this.tlFadeOut = tl
    }
}