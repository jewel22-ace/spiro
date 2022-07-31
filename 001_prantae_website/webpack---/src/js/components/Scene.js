import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import {
    EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {
    RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import {
    SMAAPass
} from 'three/examples/jsm/postprocessing/SMAAPass.js'

import Stats from 'stats-js'
// import GUI from './Gui'

import LoaderManager from '~managers/LoaderManager'
import ResizeManager from '~managers/ResizeManager'
import RaycasterManager from '~managers/RaycasterManager'
import ScrollManager from '~managers/ScrollManager'

import {
    RAF,
    WINDOW_RESIZE,
    START_SCENE
} from '~constants/'
import DEBUG from '~data/debug'
// import { Pane } from 'tweakpane'

// components
import CameraController from './CameraController'
import Flags from './Flags'
import Road from './Road'
import GradientTexture from './GradientTexture/GradientTexture'
import SectionTitle from './SectionTitles/SectionTitle'
import Obstacles from './Obstacles/Obstacles'
import ProjectPostProcessing from './ProjectPostProcessing/ProjectPostProcessing'
import About from './About/About'

import PROJECTS from '~data/projects.json'
import LABS from '~data/labs.json'
import {
    Color,
    WebGLRenderer,
    Scene
} from 'three'
import 'regenerator-runtime/runtime.js'
import {
    getGPUTier
} from 'detect-gpu'
import Intro from './Intro/Intro'
import Overlay from './Overlay/Overlay'
import {
    MOBILE_BREAKPOINT,
    OVERVIEW_TYPE,
    ROAD_TYPE,
    SWITCH_VIEW
} from '../constants'
import TemplateManager from '../managers/TemplateManager'
import Asteroids from './Asteroids/Asteroids'

const ASSETS = 'assets-scene/'

export default class SceneBase {
    constructor(el) {
        this.canvas = el
        this.hasBeenReset = false
        // this.setUnits()
        this.intro = new Intro()
        this.testGPU(this.load)

        // disable scroll history
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual'
        }
    }

    // GPU detection
    async testGPU(callback) {
        const gpuTier = await getGPUTier()
        ResizeManager.setPixelRatio(gpuTier)
        callback()
    }

    load = () => {
        // initialise DPR and size for the first time
        ResizeManager.handleResize()

        const assets = [{
                name: 'displacement',
                texture: `${ASSETS}ripple-logo10.png`,
            },
            {
                name: 'arrow',
                texture: `${ASSETS}arrow.jpeg`,
            },
            {
                name: 'twitter',
                texture: `${ASSETS}twitter.jpg`,
            },
            {
                name: 'email',
                texture: `${ASSETS}email.jpg`,
            },
            {
                name: 'github',
                texture: `${ASSETS}github.jpg`,
            },
            {
                name: 'alvar',
                bmfont: 'fonts/Silka-RegularItalic.fnt',
            },
            {
                name: 'alvar_glyph',
                texture: 'fonts/Silka-RegularItalic-atlas.png',
            },
            {
                name: 'roadgeek',
                bmfont: 'fonts/Roadgeek-2005-Mittelschrift.fnt',
            },
            {
                name: 'roadgeek_glyph',
                texture: 'fonts/Roadgeek-2005-Mittelschrift-atlas.png',
            },
            {
                name: 'lato',
                bmfont: 'fonts/Lato-Regular.fnt',
            },
            {
                name: 'lato_glyph',
                texture: 'fonts/Lato-Regular-atlas.png',
            },
            {
                name: 'ibmplexsans',
                bmfont: 'fonts/IBMPlexSans-Bold.fnt',
            },
            {
                name: 'ibmplexsans_glyph',
                texture: 'fonts/IBMPlexSans-Bold-Atlas.png',
            },
        ]

        // load projects assets
        const breakpointPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile/' : ''
        const breakpointDataPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile' : 'images'
        // PROJECTS.forEach(data => {
        //   // if (data.placeholder) {
        //   //   // preload placeholder
        //   //   assets.push({ name: `${data.id}_placeholder`, texture: `${ASSETS}projects/${data.placeholder}` })
        //   // }
        //   // data[breakpointDataPath].forEach((image, index) => {
        //   //   if (!/mp4?$/.test(image)) {
        //   //     // If no video
        //   //     // LoaderManager.loadTexture(`${ASSETS}projects/${breakpointPath}${image}`, `${data.id}_${index}`, true)
        //   //     assets.push({ name: `${data.id}_${index}`, texture: `${ASSETS}projects/${breakpointPath}${image}` })
        //   //   }
        //   // })
        // })

        // // load labs assets
        // LABS.forEach(data => {
        //   data[breakpointDataPath].forEach((image, index) => {
        //     if (!/mp4?$/.test(image)) {
        //       // LoaderManager.loadTexture(`${ASSETS}projects/${breakpointPath}${image}`, `${data.id}_${index}`, true)
        //       assets.push({ name: `${data.id}_${index}`, texture: `${ASSETS}projects/${breakpointPath}${image}` })
        //     }
        //   })
        // })

        LoaderManager.load(assets, this.intro.finishLoaded)
        // this.intro.start()
        // LoaderManager.load(assets, TemplateManager.introButton.handleClick)

        // start RAF
        window.addEventListener(START_SCENE, this.init)
    }

    init = () => {
        this.initGUI()

        this.buildStats()
        this.buildScene()
        this.buildRender()
        TemplateManager.transitionInFooter()
        TemplateManager.transitionInSidebar()
        // this.initTweakPane()

        this.road = new Road(this.scene)
        this.sectionTitles = []

        for (let i = 0; i < 3; i++) {
            const sectionTitle = new SectionTitle(i)
            this.sectionTitles.push(sectionTitle)
        }

        CameraController.init(this.scene)

        this.overlay = new Overlay()

        CameraController.addSectionTitle(this.sectionTitles)
        CameraController.addOverlay(this.overlay)
        this.flags = new Flags(this.scene)
        CameraController.addListFlag(this.flags.listFlag)
        this.obstacles = new Obstacles(this.scene)
        this.asteroids = new Asteroids(this.scene, this.obstacles)
        this.about = new About(this.scene)

        RaycasterManager.add(this.flags)

        if (DEBUG.mode) {
            document.body.classList.add('is-debug')
            this.buildControls()
            this.scene.add(CameraController.camera)
        } else {
            document.body.classList.remove('is-debug')
            this.scene.add(CameraController.cameraBox)
        }

        this.gradientT = new GradientTexture()
        this.projectPostProcessing = new ProjectPostProcessing()

        ScrollManager.addGradient(this.gradientT)
        ScrollManager.addObstacles(this.obstacles)
        ScrollManager.addSectionTitles(this.sectionTitles)
        ScrollManager.addProjectPP(this.projectPostProcessing)
        ScrollManager.addRoad(this.road)

        this.scene.background = this.gradientT.rTarget.texture
        this.events(true)

        // postprocessing
        this.composer = new EffectComposer(this.renderer)
        const renderPass = new RenderPass(this.scene, CameraController.camera)
        this.composer.addPass(renderPass)

        this.composer.addPass(this.projectPostProcessing.pass)

        this.smaaPass = new SMAAPass(ResizeManager.width, ResizeManager.height)

        // this.fxaaPass = new ShaderPass(FXAAShader)
        // this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (ResizeManager.width * ResizeManager.dpr)
        // this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (ResizeManager.height * ResizeManager.dpr)
        if (ResizeManager.tier >= 3) {
            this.composer.addPass(this.smaaPass)
        }

        RaycasterManager.isReady = true

        // intro
        CameraController.introToDefaultView()
        this.road ? .introToDefaultView()
    }

    initGUI() {
        // GUI.init()
        // gui
        this.guiController = {
            debug: DEBUG.mode,
            toggle_helpers: DEBUG.toggle_helpers,
            ppForce: 1.0,
        }
        // const folder = GUI.addFolder('Scene')
        // // folder.open()

        // folder.add(this.guiController, 'debug').onChange(this.guiChange)
        // folder
        //   .add(this.guiController, 'toggle_helpers')
        //   .name('toggle helpers')
        //   .onChange(this.guiChange)
        // folder
        //   .add(this.guiController, 'ppForce', 0, 1000)
        //   .step(0.1)
        //   .name('ppForce')
        //   .onChange(this.guiChangePP)
    }

    guiChange = () => {
        this.hasBeenReset = true
        DEBUG.mode = this.guiController.debug
        DEBUG.toggle_helpers = this.guiController.toggle_helpers
        this.destroy()
        this.init()
    }

    // initTweakPane() {
    //   const pane = new Pane()
    //   // const gui = folder !== undefined ? folder : this.gui
    //   // return gui.addMonitor(obj, value, props)
    //   const speed = 1000 / 10
    //   // this.addFPS(folder)
    //   // this.addMonitor(folder, webgl.renderer.info.render, 'calls', {
    //   //   interval: speed,
    //   //   label: 'DrawCalls',
    //   // })
    //   // pane.addMonitor(this.renderer.info.render, 'calls', {
    //   //   interval: speed,
    //   //   label: 'DrawCalls',
    //   // })
    // }

    events(method = true) {
        const eventListener = method ? 'addEventListener' : 'removeEventListener'
        window[eventListener](WINDOW_RESIZE, this.handleResize, {
            passive: true
        })
        window[eventListener](RAF, this.render, {
            passive: true
        })
        window[eventListener](SWITCH_VIEW, this.switchView)
    }

    switchView = e => {
        const {
            type
        } = e.detail
        if (type === OVERVIEW_TYPE) {
            this.asteroids.hideAll()
            this.obstacles.showAll()
        } else if (type === ROAD_TYPE) {
            this.asteroids.showAll()
            this.obstacles.hideAll()
        }
    }

    buildStats() {
        this.stats = new Stats()
        this.stats.showPanel(0)
        // document.body.appendChild(this.stats.dom)
    }

    buildScene() {
        this.scene = new Scene()
        this.scene.background = new Color(0xffffff)
    }

    buildRender() {
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            // autoClearColor: false,
            premultipliedAlpha: false,
            // autoClear: false,
            transparent: false,
        })
        this.setRendererDPR()

        // Use antialias true only if PixelDeviceRatio is 1, not 2

        // this.renderer.toneMapping = THREE.ReinhardToneMapping // ACESFilmicToneMapping,

        this.setSizes()
    }

    buildControls() {
        this.controls = new OrbitControls(CameraController.camera, this.renderer.domElement)
        // this.controls.enableDamping = true
    }

    // RAF
    render = e => {
        const {
            now,
            deltaTime
        } = e.detail

        this.stats.begin()

        if (this.controls) this.controls.update() // for damping

        if (this.flags) {
            // update the picking ray with the camera and mouse position
            this.flags.render(now, deltaTime)
        }

        if (this.road) {
            this.road.render(deltaTime)
        }

        // if (this.lines) {
        //   this.lines.render(now)
        // }

        if (this.particlesLine) {
            this.particlesLine.render(deltaTime)
        }

        if (this.asteroids && ScrollManager.introFinished) {
            this.asteroids.render(now)
        }

        CameraController.render(now, deltaTime)

        if (this.gradientT) {
            this.gradientT.render(deltaTime)
        }
        //   // Render target for gradient
        this.renderer.setRenderTarget(this.gradientT.rTarget)
        this.renderer.render(this.gradientT.scene, this.gradientT.camera)
        this.renderer.setRenderTarget(null)

        if (!this.projectPostProcessing.used) {
            //   // Rendering scene after that
            this.renderer.render(this.scene, CameraController.camera)
        } else {
            // Use postprocessing
            // this.renderer.clear()
            this.projectPostProcessing.render(deltaTime)
            this.composer.render()
        }

        this.stats.end()
    }

    handleResize = () => {
        // this.setUnits()

        // Update camera
        CameraController.camera.aspect = ResizeManager.width / ResizeManager.height
        CameraController.camera.updateProjectionMatrix()

        this.setSizes()

        // here we can resize the gradientT texture
        this.smaaPass.setSize(ResizeManager.width, ResizeManager.height)
        // this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (ResizeManager.width * ResizeManager.dpr)
        // this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (ResizeManager.height * ResizeManager.dpr)
    }

    setRendererDPR = () => {
        // console.log('set dpr', ResizeManager.tier, ResizeManager.dpr)
        this.renderer.setPixelRatio(ResizeManager.dpr)
    }

    setSizes() {
        this.renderer.setSize(ResizeManager.width, ResizeManager.height)
        this.composer ? .setSize(ResizeManager.width, ResizeManager.height)

        this.testGPU(this.setRendererDPR)
    }

    destroy() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i]
            this.scene.remove(obj)
        }

        // GUI.destroy()

        this.events(false)
    }
}