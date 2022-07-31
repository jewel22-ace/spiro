import LoaderManager from '~managers/LoaderManager'
// import * as THREE from 'three'
import {
    TimelineLite
} from 'gsap/gsap-core'
import ABOUT from '~data/about'

import {
    DARK_GREY,
    PROJECT_STICK_HEIGHT_AB
} from '../../../constants'

// BMFONTS
import createGeometry from 'three-bmfont-text'
import MSDFShader from 'three-bmfont-text/shaders/msdf'
import vertexShader from './texts.vert'
import fragmentShader from './texts.frag'

const OFFSET_Y = 4
const INT_Y = 1.7
const INIT_Y = 3

export default class Texts {
    object3d = new THREE.Object3D()
    constructor(position, lookAt) {
        this.position = position
        this.position.y += PROJECT_STICK_HEIGHT_AB + OFFSET_Y
        this.lookAt = lookAt
        this.lookAt.y += PROJECT_STICK_HEIGHT_AB + OFFSET_Y
        this.font = LoaderManager.subjects.lato.bmfont
        this.size = 0.035

        this.paragraphs = []

        ABOUT.descriptions.forEach((text, index) => {
            let align = 'left'
            if (index === 1) {
                align = 'center'
            }

            const p = this.createParagraph(text, align)
            this.paragraphs.push(p)
            this.object3d.add(p)
        })

        this.object3d.position.copy(this.position)
        this.object3d.lookAt(this.lookAt)

        // position texts above each other in correct order:
        let currentY = INIT_Y
        for (let i = this.paragraphs.length - 1; i >= 0; i--) {
            // console.log('yo')
            const text = this.paragraphs[i]
            const prevText = this.paragraphs[i + 1]
            if (prevText) {
                currentY += prevText.geometry.layout.height * this.size
                currentY += INT_Y
            }
            text.translateY(currentY)
            text.initY = text.position.y
        }
    }

    createParagraph(text, align) {
        // Create a geometry of packed bitmap glyphs
        const geometry = createGeometry({
            font: this.font,
            text,
            width: 1400,
            align,
            lineHeight: 52,
        })
        geometry.computeBoundingBox()

        this.uniforms = {
            map: {
                value: LoaderManager.subjects.lato_glyph.texture
            }, // font glyphs
            opacity: {
                value: 0
            },
            uNbChars: {
                value: geometry.layout.glyphs.length
            },
            uHeight: {
                value: geometry.layout.height,
            },
            uProgress: {
                value: 0,
            },
            uSize: {
                value: new THREE.Vector2(geometry.boundingBox.max.x, geometry.boundingBox.max.y),
            },
            color: {
                value: new THREE.Color(DARK_GREY),
            },
        }

        let material = new THREE.RawShaderMaterial(
            MSDFShader({
                vertexShader,
                fragmentShader,
                // color: DARK_GREY, // We'll remove it later when defining the fragment shader
                side: THREE.DoubleSide,
                transparent: true,
                negate: false,
                uniforms: this.uniforms,
            }),
        )

        const mesh = new THREE.Mesh(geometry, material)
        this.geometry = geometry

        mesh.scale.set(this.size, -this.size, this.size)

        return mesh
    }

    fadeIn() {
        this.tlFadeOut ? .kill()
        const duration = 1.2
        const durationOpacity = 1
        const tl = new TimelineLite()

        let intv = 0.1
        const offsetY = 2.5
        const delay = 0.5

        this.paragraphs.forEach((mesh, index) => {
            const initPos = mesh.initY
            tl.fromTo(
                mesh.position, {
                    y: initPos - offsetY,
                }, {
                    y: initPos,
                    ease: 'quart.out',
                    duration,
                },
                delay + intv * index,
            )

            tl.fromTo(
                mesh.material.uniforms.opacity, {
                    value: 0,
                }, {
                    value: 1,
                    ease: 'linear',
                    duration: durationOpacity,
                },
                delay + intv * index,
            )
        })

        this.tlFadeIn = tl
    }

    fadeOut() {
        this.tlFadeIn ? .kill()
        const duration = 0.5
        const tl = new TimelineLite()
        this.paragraphs.forEach((mesh, index) => {
            tl.to(
                mesh.material.uniforms.opacity, {
                    value: 0,
                    ease: 'linear',
                    duration,
                },
                0,
            )
        })

        this.tlFadeOut = tl
    }
}