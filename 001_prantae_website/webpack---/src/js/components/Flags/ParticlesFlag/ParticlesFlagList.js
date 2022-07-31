import ParticlesFlag from './ParticlesFlag'
import PROJECTS from '~data/projects.json'
import LABS from '~data/labs.json'
import ResizeManager from '../../../managers/ResizeManager'
import {
    COLORS_LAB,
    COLORS_PROJECT,
    LISTVIEW_TYPE,
    MOBILE_BREAKPOINT,
    OVERVIEW_TYPE,
    ROAD_TYPE,
    SWITCH_VIEW,
} from '../../../constants'
import LoaderManager from '../../../managers/LoaderManager'
import {
    TweenLite
} from 'gsap/gsap-core'
import {
    TimelineLite
} from 'gsap/gsap-core'
import {
    LinearFilter
} from 'three'

export default class ParticlesFlagList extends ParticlesFlag {
    constructor(scene, index = 0, directionCenter, touch, type) {
        super(scene, index, directionCenter, touch, type)
        window.addEventListener(SWITCH_VIEW, e => {
            const {
                type
            } = e.detail

            if (type === OVERVIEW_TYPE || type === ROAD_TYPE) {
                this.hide()
            } else if (type === LISTVIEW_TYPE) {
                this.show()
            }
        })
        this.hide()

        this.setUniforms()
    }

    hide() {
        this.object3d.visible = false
    }

    show() {
        this.setTextures()
        this.object3d.visible = true
    }

    setTextures() {
        if (this.textureSet) return
        this.textureSet = true
        this.index = 0
        this.textures = []
        const breakpointDataPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile' : 'images'
        const breakpointPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile/' : ''
        this.currentColor = COLORS_PROJECT[0]

        PROJECTS.forEach((data, index) => {
            const imageName = data[breakpointDataPath][0]
            let obj = {
                source: null,
                video: null,
            }
            if (/mp4?$/.test(imageName)) {
                // Video
                obj = this.createVideoTexture(imageName)
            } else {
                LoaderManager.loadTexture(
                    `assets-scene/projects/${breakpointPath}${imageName}`,
                    `${PROJECTS[index].id}_0`,
                    true,
                ).then(result => {
                    obj.source = result
                    obj.source.minFilter = LinearFilter
                    obj.source.needsUpdate = false
                })
            }

            this.textures.push(obj)
        })

        LABS.forEach((data, index) => {
            const imageName = data[breakpointDataPath][0]
            let obj = {
                source: null,
                video: null,
            }
            if (/mp4?$/.test(imageName)) {
                // Video
                obj = this.createVideoTexture(imageName)
            } else {
                LoaderManager.loadTexture(
                    `assets-scene/projects/${breakpointPath}${imageName}`,
                    `${LABS[index].id}_0`,
                    true,
                ).then(result => {
                    obj.source = result
                    obj.source.minFilter = LinearFilter
                    obj.source.needsUpdate = false
                })
            }

            this.textures.push(obj)
        })

        this.texture = this.textures[0].source
        // super.updateTextures('next', true)
    }

    setUniforms() {
        this.material.uniforms.uMenuViewProgress.value = 1
        this.material.uniforms.uBend.value = 0.18
        this.material.uniforms.uPointSize.value = 4.33
        this.material.uniforms.uAmplitude.value = 1.6
        this.material.uniforms.uColor.value = new THREE.Color(
            this.currentColor.r / 255,
            this.currentColor.g / 255,
            this.currentColor.b / 255,
        )
    }

    updateTextures(index) {
        if (index > PROJECTS.length - 1) {
            this.currentColor = COLORS_LAB[0]
        } else {
            this.currentColor = COLORS_PROJECT[0]
        }
        this.sliderIndex = index
        this.material.uniforms.uTexture.value = this.textures[index].source
        this.material.uniforms.uTextureNext.value = this.textures[index].source
        this.material.uniforms.uColor.value = new THREE.Color(
            this.currentColor.r / 255,
            this.currentColor.g / 255,
            this.currentColor.b / 255,
        )
        this.material.needsUpdate = true
    }

    updateColors(index) {
        // this.sliderIndex = index
        // return

        const duration = 2
        const currentColor = { ...this.currentColor
        }
        let targetColor
        if (index > PROJECTS.length - 1) {
            targetColor = { ...COLORS_LAB[0]
            }
        } else {
            targetColor = { ...COLORS_PROJECT[0]
            }
        }
        this.tlColor ? .kill()
        this.tlColor = new TimelineLite()
        this.tlColor.to(currentColor, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'expo.out',
            duration,
            onUpdate: () => {
                const color = new THREE.Color(currentColor.r / 255, currentColor.g / 255, currentColor.b / 255)
                this.material.uniforms.uColor.value = color
                this.material.needsUpdate = true
                // this.pass.material.uniforms.uBgColor.value = color
            },
            onComplete: () => {
                this.currentColor = targetColor
            },
        })
    }
}