import {
    OVERLAY_TRANSITION,
    OVERLAY_INTRO_OUT,
    WINDOW_RESIZE,
    MOBILE_BREAKPOINT
} from '../../constants'
import ResizeManager from '../../managers/ResizeManager'
import CameraController from '../CameraController'
import vertexShader from './overlay.vert'
import fragmentShader from './overlay.frag'
// import GUI from '../Gui'
import {
    TimelineLite
} from 'gsap/gsap-core'
import TemplateManager from '../../managers/TemplateManager'
import {
    TweenLite
} from 'gsap/gsap-core'

export default class Overlay {
    progress = {
        value: 0
    }
    duration = 2.2
    durationPause = 1
    distance = 10

    guiController = {
        uProgress: 1,
        uZoom: 0.03,
    }

    constructor() {
        const planeGeo = new THREE.PlaneGeometry(1, 1)

        this.uniforms = {
            distance: {
                value: this.distance,
            },
            fov: {
                value: THREE.Math.degToRad(CameraController.camera.fov) * 0.5,
            },
            uColor: {
                value: new THREE.Color(0xffffff),
            },
            uSize: {
                value: new THREE.Vector2(ResizeManager.width, ResizeManager.height),
            },
            uReverse: {
                value: true,
            },
            uZoom: {
                value: ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 0.04 : this.guiController.uZoom,
            },
            uProgress: {
                value: this.guiController.uProgress,
            },
        }

        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            // visible: false,
        })

        this.mesh = new THREE.Mesh(planeGeo, material)

        window.addEventListener(WINDOW_RESIZE, this.handleResize, false)

        // const folder = GUI.addFolder('Transi')
        // folder
        //   .add(this.guiController, 'uProgress', 0, 1)
        //   .step(0.01)
        //   .onChange(this.guiChange)
        // folder
        //   .add(this.guiController, 'uZoom', 0, 1)
        //   .step(0.01)
        //   .onChange(this.guiChange)
        // folder.open()

        window.addEventListener(OVERLAY_INTRO_OUT, this.introOut)
        window.addEventListener(OVERLAY_TRANSITION, this.transitionInOut)
    }

    // guiChange = () => {
    //   this.uniforms.uZoom.value = this.guiController.uZoom
    //   this.uniforms.uProgress.value = this.guiController.uProgress
    // }

    transitionInOut = () => {
        this.tl ? .kill()
        this.tl = new TimelineLite()
        this.mesh.visible = true
        this.uniforms.uReverse.value = false

        const htmlDuration = 0.2

        this.tl.add(() => {
            this.uniforms.uReverse.value = false
            this.uniforms.uProgress.value = 0
        })

        TweenLite.to([TemplateManager.targetProject], {
            duration: htmlDuration,
            // ease: 'quad.out',
            opacity: 0,
        })

        TemplateManager.menu.hide()
        TemplateManager.hideFooter()

        this.tl.fromTo(
            this.uniforms.uProgress, {
                value: 0,
            }, {
                duration: this.duration,
                ease: 'quad.out',
                value: 1,
            },
            'animIn',
        )

        this.tl.add(() => {
            this.uniforms.uReverse.value = true
            this.uniforms.uProgress.value = 0
        }, `animIn+=${this.durationPause}`)

        this.tl.fromTo(
            this.uniforms.uProgress, {
                value: 0,
            }, {
                duration: this.duration,
                ease: 'quad.out',
                value: 1,
            },
            `animIn+=${this.durationPause}`,
        )

        this.tl.add(() => {
            this.mesh.visible = false
        })

        this.tl.to(
            [TemplateManager.targetProject], {
                duration: htmlDuration,
                // ease: 'quad.out',
                opacity: 1,
            },
            `animIn+=${this.durationPause + 0.5}`,
        )
    }

    introOut = () => {
        this.tl = new TimelineLite()
        this.tl.add(() => {
            // this.uniforms.uReverse.value = false
            this.uniforms.uProgress.value = 0
        })

        this.tl.fromTo(
            this.uniforms.uProgress, {
                value: 0,
            }, {
                duration: this.duration,
                ease: 'quad.out',
                value: 1,
            },
            0.5,
        )

        this.tl.add(() => {
            this.mesh.visible = false
        })
    }

    handleResize = () => {
        this.uniforms.uSize.value = new THREE.Vector2(ResizeManager.width, ResizeManager.height)
    }
}