import ScrollManager from '~managers/ScrollManager'
import vertexShader from './particle.vert'
import fragmentShader from './particle.frag'
import {
    lerp,
    randomFloat
} from '~utils/math'
import glsl from 'glslify'
import {
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Points,
    RawShaderMaterial,
    AdditiveBlending
} from 'three'
import ResizeManager from '~managers/ResizeManager'
import {
    SWITCH_VIEW
} from '~constants/'
import {
    TimelineLite
} from 'gsap/gsap-core'
import {
    DELAY_INTRO_START_CAMERA,
    INTRO_TYPE,
    LISTVIEW_TYPE,
    MOBILE_BREAKPOINT,
    OVERVIEW_TYPE,
    TRANSITION_MENU_MAX_DURATION,
    WINDOW_RESIZE,
} from '../../constants'

const PROGRESS_OFFSET = 0.093
const PROGRESS_LERP = 0.05 / 16

export default class ParticlesLines {
    constructor(points, index, menuViewOnly) {
        this.points = points
        this.menuViewOnly = menuViewOnly
        this.targetProgress = 0
        let dpr = ResizeManager.dpr
        if (ResizeManager.breakpoint === MOBILE_BREAKPOINT) {
            dpr = 1
        }
        const uniforms = {
            uTime: {
                value: 0.0,
            },
            uProgress: {
                value: 0.0,
            },
            uNbPoints: {
                value: 0.0,
            },
            uAlphaOffset: {
                value: randomFloat(0, 40),
            },
            uPixelRatio: {
                value: dpr,
            },
            uScaleHeightPointSize: {
                value: (ResizeManager.dpr * ResizeManager.height) / 2, // reusing that from Three.js SizeAttenuation shader in Points
            },
            uMenuViewProgress: {
                value: 0,
            },
            uColor: {
                value: new Color(0x000000),
            },
        }

        this.material = new RawShaderMaterial({
            uniforms,
            vertexShader: glsl(vertexShader),
            fragmentShader: glsl(fragmentShader),
            // blending: AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            // vertexColors: true,
            opacity: 1.0,
        })

        this.createGeometry()

        this.mesh = new Points(this.geometry, this.material)
        if (this.menuViewOnly) {
            this.mesh.visible = false
        }
        WINDOW_RESIZE
        window.addEventListener(SWITCH_VIEW, this.switchView)
        window.addEventListener(WINDOW_RESIZE, this.handleResize)
    }

    createGeometry() {
        this.geometry = new BufferGeometry()

        const indexes = []
        const positions = []
        const sizes = []

        let inc = 0

        for (let p of this.points) {
            positions.push(p.x, p.y, p.z)
            sizes.push(0.025)
            // indexes.push(100.0 * Math.sin(Math.PI * (inc / (this.points.length / 2))))
            indexes.push(inc)

            inc++
        }

        this.material.uniforms.uNbPoints.value = this.points.length

        this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
        this.geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1))
        this.geometry.setAttribute('index', new Float32BufferAttribute(indexes, 1))
    }

    render(deltaTime) {
        this.material.uniforms.uTime.value += deltaTime / 2500.0

        const {
            progress,
            autoScrolled
        } = ScrollManager

        this.targetProgress = lerp(this.targetProgress, progress + PROGRESS_OFFSET, PROGRESS_LERP * deltaTime)

        let finalProgress = this.targetProgress

        if (autoScrolled) {
            this.targetProgress = progress + PROGRESS_OFFSET
        }

        this.material.uniforms.uProgress.value = finalProgress
    }

    switchView = e => {
        const {
            type,
            goToProject
        } = e.detail
        this.tlSwitchView ? .kill()
        this.tlSwitchView = new TimelineLite()

        if (type === OVERVIEW_TYPE || type === LISTVIEW_TYPE) {
            const duration = TRANSITION_MENU_MAX_DURATION
            this.tlSwitchView.to(this.material.uniforms.uMenuViewProgress, {
                value: 1,
                duration,
            })

            if (this.menuViewOnly) {
                this.mesh.visible = true
            }
        } else if (type === INTRO_TYPE) {
            this.tlSwitchView = new TimelineLite({
                paused: false,
                onComplete: () => {
                    if (this.menuViewOnly) {
                        this.mesh.visible = false
                    }
                },
                delay: DELAY_INTRO_START_CAMERA,
            })

            const duration = TRANSITION_MENU_MAX_DURATION
            this.tlSwitchView.fromTo(
                this.material.uniforms.uMenuViewProgress, {
                    value: 1,
                }, {
                    value: 0,
                    duration,
                    ease: 'quart',
                },
                0,
            )

            if (this.menuViewOnly) {
                this.mesh.visible = true
            }
        } else {
            const duration = goToProject ? 1 : TRANSITION_MENU_MAX_DURATION - 1
            this.tlSwitchView.to(this.material.uniforms.uMenuViewProgress, {
                value: 0,
                duration,
            })
            if (this.menuViewOnly) {
                this.mesh.visible = false
            }
        }
    }

    handleResize = () => {
        this.material.uniforms.uPixelRatio.value = ResizeManager.dpr
        this.material.uniforms.uScaleHeightPointSize.value = (ResizeManager.dpr * ResizeManager.height) / 2 // reusing that from Three.js SizeAttenuation shader in Points
    }
}