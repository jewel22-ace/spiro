import LoaderManager from '~managers/LoaderManager'
import ResizeManager from '~managers/ResizeManager'
import fragmentShader from './particlesFlag.frag'
import vertexShader from './particlesFlag.vert'
import glsl from 'glslify'
import {
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Points,
    RawShaderMaterial,
    Vector2,
    Vector3,
    SphereGeometry,
    LinearFilter,
    FrontSide,
    VideoTexture,
    RGBAFormat,
} from 'three'
// import GUI from '../../Gui'
import {
    randomFloat,
    randomInt,
    clamp,
    shuffle
} from '~utils/math'
import PROJECTS from '~data/projects.json'
import LABS from '~data/labs.json'
import {
    degToRad
} from '~utils/three'
import {
    WINDOW_RESIZE,
    PROJECT_STICK_HEIGHT,
    PLANE_MATERIAL,
    PLANE_GEO,
    COLORS_PROJECT,
    COLORS_LAB,
    CIRCLE_GEO,
    CIRCLE_MATERIAL,
} from '~constants/'
import {
    TweenLite
} from 'gsap/all'
import {
    TimelineLite
} from 'gsap/gsap-core'
import CameraController from '../../CameraController'
import {
    isVideoPlaying
} from '~utils/dom'
import {
    MOBILE_BREAKPOINT
} from '../../../constants'

// const HEIGHT_POINTSIZE_REF = 1000
// const HEIGHT_POINTSIZE_REF_ZOOMED = 800
const POINTS_MULTIPLIER = 2
const NB_POINTS_W = 45
const TRANSITION_DURATION = 2.7
const MIN_FORCE = 1.3
const MAX_FORCE = 2.5

const SPHERE_GEO = new SphereGeometry(2, 32, 32)
const SPHERE_MAT = new MeshBasicMaterial({
    color: 0xff0000,
    depthWrite: false,
    transparent: true
})

// VideoTexture.prototype.update = throttle(videoFrameRateFunc, 1000 / 60)

function overrideUpdate() {
    const video = this.image
    // const hasVideoFrameCallback = 'requestVideoFrameCallback' in video

    // if (hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA) {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        if (isVideoPlaying(video)) {
            this.needsUpdate = true
        }
    }
}

VideoTexture.prototype.update = overrideUpdate

export default class ParticlesFlag {
    guiController = {
        uPointSize: 1.86, // 391, // 507 for 1000px Height
        uFrequency: 339.4,
        uStormProgress: 1.0,
        uTransitionProgress: 0.0,
        uForce: MAX_FORCE,
        uProj: false,
        uAlpha: 1.0,
        uAmplitude: 3.0,
        uStripForce: 2.7,
        uStripMin: 0.47,
        uBend: 0.7,
        yes: 100000,
        uTest: 2.46,
        uTextureLoadProgress: 0,
    }

    object3d = new Object3D()
    textures = []
    zoomed = false
    sliderIndex = 0

    constructor(scene, index = 0, directionCenter, touch, type) {
        this.index = index
        this.scene = scene
        this.type = type
        this.directionCenter = directionCenter
        this.initHeight = ResizeManager.height

        if (type === 'project') {
            this.currentColor = COLORS_PROJECT[0]
        } else if (type === 'lab') {
            this.currentColor = COLORS_LAB[0]
        } else if (type === 'list') {
            this.currentColor = COLORS_PROJECT[0]
        }

        this.touch = touch
        // this.object3D.material.uniforms.uTouch.value = this.touch.texture

        // if (index === 0 && this.type === 'list') this.initGUI()
        let aspectRatio
        if (this.texture ? .image ? .naturalWidth) {
            aspectRatio = this.texture.image.naturalWidth / this.texture.image.naturalHeight
        } else {
            aspectRatio = this.texture ? .image.videoWidth / this.texture ? .image.videoHeight

            if (this.texture ? .image ? .videoWidth === 0) {
                aspectRatio = 16 / 9
            }
        }
        aspectRatio = 16 / 9
        this.width = NB_POINTS_W // this.texture.image.naturalWidth
        this.height = this.width / aspectRatio // this.texture.image.naturalHeight

        // add Plane for Raycaster
        this.planeGeo = PLANE_GEO
        this.plane = new Mesh(PLANE_GEO, PLANE_MATERIAL)
        this.plane.name = 'particleFlagPlane'
        this.plane.position.z -= 2
        this.plane.scale.set(this.width, this.height, 1)

        // this.planeGeo.center()
        this.object3d.add(this.plane)

        // add Circle for Raycaster
        this.circleGeo = CIRCLE_GEO
        this.circle = new Mesh(CIRCLE_GEO, CIRCLE_MATERIAL)
        this.circle.name = 'particleFlagCircle'
        const s = 5
        // this.circle.position.z += 10
        this.circle.scale.set(s, s, 1)
        this.object3d.add(this.circle)

        this.init()
        this.anim = 'out'

        if (this.scene) {
            this.scene.add(this.object3d)
            // setTimeout(this.goNext, 2000)
        }
    }

    setTextures() {
        const index = this.index
        const breakpointDataPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile' : 'images'

        if (this.type === 'project') {
            PROJECTS[index][breakpointDataPath].forEach((imageName, imageIndex) => {
                let obj = {
                    source: null,
                    video: null,
                    loaded: false,
                }
                if (/mp4?$/.test(imageName)) {
                    obj = this.createVideoTexture(imageName)
                }

                this.textures.push(obj)
            })
        } else if (this.type === 'lab') {
            this.currentColor = COLORS_LAB[0]
            LABS[index][breakpointDataPath].forEach((imageName, imageIndex) => {
                let obj = {
                    source: null,
                    video: null,
                    loaded: false,
                }
                if (/mp4?$/.test(imageName)) {
                    obj = this.createVideoTexture(imageName)
                }
                this.textures.push(obj)
            })
        }

        this.texture = this.textures[this.sliderIndex].source
    }

    loadTextureImage() {
        return new Promise(resolve => {
            // console.log('load tex', this.index)
            const index = this.index
            const breakpointDataPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile' : 'images'
            const breakpointPath = ResizeManager.breakpoint === MOBILE_BREAKPOINT ? 'mobile/' : ''

            if (this.type === 'project') {
                PROJECTS[index][breakpointDataPath].forEach((imageName, imageIndex) => {
                    const isCurrent = imageIndex === this.sliderIndex
                    if (this.textures[imageIndex].loaded) {
                        if (isCurrent) {
                            this.material.uniforms.uTexture.value = this.textures[imageIndex].source
                            resolve()
                        }
                        return
                    }

                    if (!/mp4?$/.test(imageName)) {
                        LoaderManager.loadTexture(
                            `assets-scene/projects/${breakpointPath}${imageName}`,
                            `${PROJECTS[index].id}_${imageIndex}`,
                            true,
                        ).then(result => {
                            this.textures[imageIndex].source = result
                            this.textures[imageIndex].source.minFilter = LinearFilter
                            this.textures[imageIndex].source.needsUpdate = false
                            this.textures[imageIndex].loaded = true
                            if (isCurrent) {
                                this.material.uniforms.uTexture.value = result
                                resolve()
                            }
                        })
                        //  // please use 1024 width images for Mobile
                    }
                })
            } else if (this.type === 'lab') {
                this.currentColor = COLORS_LAB[0]
                LABS[index][breakpointDataPath].forEach((imageName, imageIndex) => {
                    const isCurrent = imageIndex === this.sliderIndex
                    if (this.textures[imageIndex].loaded) {
                        if (isCurrent) {
                            this.material.uniforms.uTexture.value = this.textures[imageIndex].source
                            resolve()
                        }
                        return
                    }

                    if (!/mp4?$/.test(imageName)) {
                        LoaderManager.loadTexture(
                            `assets-scene/projects/${breakpointPath}${imageName}`,
                            `${LABS[index].id}_${imageIndex}`,
                            true,
                        ).then(result => {
                            this.textures[imageIndex].source = result
                            this.textures[imageIndex].source.minFilter = LinearFilter
                            this.textures[imageIndex].source.needsUpdate = false
                            this.textures[imageIndex].loaded = true
                            if (isCurrent) {
                                this.material.uniforms.uTexture.value = result
                                resolve()
                            }
                        })
                        //  // please use 1024 width images for Mobile
                    }
                })
            }
        })
    }

    createVideoTexture(imageName) {
        const video = document.createElement('video')
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.crossorigin = 'anonymous'
        video.preload = 'metadata'
        video.src = `assets-scene/projects/${imageName}`
        // video.load()

        const texture = new VideoTexture(video)
        texture.minFilter = LinearFilter
        texture.magFilter = LinearFilter
        texture.format = RGBAFormat
        texture.needsUpdate = true

        return {
            source: texture,
            video
        }
    }

    // initGUI() {
    //   const folder = GUI.addFolder('ParticlesFlag')

    //   folder
    //     .add(this.guiController, 'uPointSize', 0, 10)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uTest', 0, 100)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uFrequency', 0, 2000)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uStormProgress', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uTransitionProgress', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uForce', 0, 20)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uAlpha', 0, 1)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uAmplitude', 0, 10)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uStripForce', 0, 100)
    //     .step(0.1)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uStripMin', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'uBend', 0, 1)
    //     .step(0.01)
    //     .onChange(this.guiChange)
    //   folder.add(this.guiController, 'uProj').onChange(this.guiChange)
    //   // folder.open()
    // }

    init() {
        // createGeometry
        this.geometry = new BufferGeometry()
        const positions = []
        // const pointScales = []
        const initPositions = []
        const angles = []
        const rdmTouchIndexes = []
        const stormSpeeds = []
        const indexes = []

        const scale = this.type === 'list' ? 1 : POINTS_MULTIPLIER
        // const pointScalesOpts = [1, 1]
        // const noise2D = makeNoise2D(Date.now())
        const offsetStormX = 20
        this.incTotalPoints = 0

        for (let i = 0; i < this.width * scale; i++) {
            for (let j = 0; j < this.height * scale; j++) {
                const x = (i + 0.5 - (this.width * scale) / 2) / scale
                const y = (j + 0.5 - (this.height * scale) / 2) / scale
                //
                positions.push(x, y, 0)

                initPositions.push(-this.directionCenter * randomFloat(this.width / 4 + offsetStormX, this.width / 2 + offsetStormX),
                    randomFloat(-this.height / 2, this.height / 4),
                    0,
                )
                // pointScales.push(pointScalesOpts[Math.floor(noise2D(x, y) + 1)])
                angles.push(Math.random() * Math.PI)
                rdmTouchIndexes.push(randomInt(0, 1))
                stormSpeeds.push(randomFloat(1, 1.2))

                // if (Math.floor(x) === 0 && Math.floor(y) === 0) {
                //   indexes.push(1.0)
                // } else {
                //   indexes.push(0.0)
                // }

                indexes.push(this.incTotalPoints)
                this.incTotalPoints++
            }
        }

        shuffle(indexes)

        this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
        this.geometry.setAttribute('aInitPosition', new Float32BufferAttribute(initPositions, 3))
        // this.geometry.setAttribute('aPointScale', new Float32BufferAttribute(pointScales, 1))
        this.geometry.setAttribute('aAngle', new Float32BufferAttribute(angles, 1))
        this.geometry.setAttribute('aRndTouchIndex', new Float32BufferAttribute(rdmTouchIndexes, 1))
        this.geometry.setAttribute('aStormSpeed', new Float32BufferAttribute(stormSpeeds, 1))
        this.geometry.setAttribute('aIndex', new Float32BufferAttribute(indexes, 1))

        window.addEventListener(WINDOW_RESIZE, this.handleResize, {
            passive: true
        })

        const uniforms = {
            uTime: {
                value: 0.0,
            },
            uFrequency: {
                value: this.guiController.uFrequency,
            },
            uTexture: {
                value: null,
            },
            uTextureNext: {
                value: null,
            },
            uPointSize: {
                value: this.guiController.uPointSize,
            },
            uScaleHeightPointSize: {
                value: (ResizeManager.dpr * ResizeManager.height) / 2, // reusing that from Three.js SizeAttenuation shader in Points
            },
            uTextureSize: {
                value: new Vector2(this.width, this.height),
            },
            uTextureLoadProgress: {
                value: this.guiController.uTextureLoadProgress,
            },
            uStormProgress: {
                value: this.guiController.uStormProgress,
            },
            uTouch: {
                value: null,
            },
            uForce: {
                value: this.guiController.uForce,
            },
            uProj: {
                value: this.guiController.uProj,
            },
            uAlpha: {
                value: this.guiController.uAlpha,
            },
            uTransitionProgress: {
                value: this.guiController.uTransitionProgress,
            },
            uAmplitude: {
                value: this.guiController.uAmplitude,
            },
            uAnimOut: {
                value: true,
            },
            uStripForce: {
                value: this.guiController.uStripForce,
            },
            uStripMin: {
                value: this.guiController.uStripMin,
            },
            uBend: {
                value: this.guiController.uBend,
            },
            uDirection: {
                value: this.directionCenter,
            },
            uScale: {
                value: 1.0,
            },
            uColor: {
                value: new Color(this.currentColor.r / 255, this.currentColor.g / 255, this.currentColor.b / 255),
            },
            uMenuViewHoverProgress: {
                value: 0.0,
            },
            uMenuViewHoverProgressTexture: {
                value: 0.0,
            },
            uMaxAlpha: {
                value: 0.72,
            },
            uTotalPoints: {
                value: this.incTotalPoints,
            },
            uRdnCircleOffset: {
                value: randomFloat(0, 100),
            },
            uPixelRatio: {
                value: ResizeManager.dpr,
            },
            uTest: {
                value: this.guiController.uTest,
            },
            uMenuViewProgress: {
                value: 0,
            },
            projectionMatrix: {
                value: CameraController.camera.projectionMatrix,
            },
        }

        this.material = new RawShaderMaterial({
            uniforms,
            vertexShader: glsl(vertexShader),
            fragmentShader: glsl(fragmentShader),
            // blending: THREE.AdditiveBlending,
            // blending: THREE.MultiplyBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: FrontSide,
        })

        this.material.needsUpdate = false

        this.mesh = new Points(this.geometry, this.material)
        // this.mesh.frustumCulled = false
        this.object3d.add(this.mesh)
        // this.object3d.frustumCulled = false
    }

    goNext = () => {
        if (this.timelineGoNext) this.timelineGoNext.kill()
        if (this.material.uniforms.uTextureLoadProgress.value < 1) return
        // prevent going next if still loading first frame
        // 0 --> 1
        this.updateTextures('next')

        this.timelineGoNext = new TimelineLite({
            onComplete: () => {
                this.updateTextures('next', true)
            },
        })
        this.timelineGoNext.fromTo(
            this.material.uniforms.uTransitionProgress, {
                value: 0
            }, {
                duration: TRANSITION_DURATION,
                value: 1,
                ease: 'quart.out',
                // onUpdate: () => console.log(this.material.uniforms.uTransitionProgress.value),
            },
        )
    }

    goPrev = () => {
        if (this.timelineGoNext) this.timelineGoNext.kill()
        if (this.material.uniforms.uTextureLoadProgress.value < 1) return
        // prevent going next if still loading first frame
        this.material.uniforms.uAnimOut.value = true

        this.updateTextures('prev')

        TweenLite.fromTo(
            this.material.uniforms.uTransitionProgress, {
                value: 1
            }, {
                value: 0,
                duration: TRANSITION_DURATION,
                ease: 'quart.out',
            },
        )
    }

    updateTextures(type, prevent = false) {
        if (type === 'next') {
            const nextIndex = this.sliderIndex + 1 === this.textures.length ? 0 : this.sliderIndex + 1
            this.material.uniforms.uTexture.value = this.textures[this.sliderIndex].source
            this.material.uniforms.uTextureNext.value = this.textures[nextIndex].source
            this.material.uniforms.uTransitionProgress.value = 0

            if (!prevent) {
                this.toggleVideos(this.textures[this.sliderIndex].video, this.textures[nextIndex].video)

                this.sliderIndex = nextIndex
            }
        } else if (type === 'prev') {
            const prevIndex = this.sliderIndex - 1 === -1 ? this.textures.length - 1 : this.sliderIndex - 1
            this.material.uniforms.uTransitionProgress.value = 1
            this.material.uniforms.uTexture.value = this.textures[prevIndex].source
            this.material.uniforms.uTextureNext.value = this.textures[this.sliderIndex].source

            if (!prevent) {
                this.toggleVideos(this.textures[this.sliderIndex].video, this.textures[prevIndex].video)
            }

            this.sliderIndex = prevIndex
        }
    }

    toggleVideos(current, next) {
        if (current) {
            current.pause()
        }

        if (next) {
            next.currentTime = 0
            next.play()
            // if (next.HAVE_FUTURE_DATA) {
            //   next.play()
            // } else {
            //   console.log('not')
            // }
        }
    }

    // guiChange = () => {
    //   const {
    //     uPointSize,
    //     uFrequency,
    //     uStormProgress,
    //     uForce,
    //     uProj,
    //     uAlpha,
    //     uTransitionProgress,
    //     uAmplitude,
    //     uStripMin,
    //     uStripForce,
    //     uBend,
    //     uTest,
    //   } = this.material.uniforms

    //   uPointSize.value = this.guiController.uPointSize
    //   uFrequency.value = this.guiController.uFrequency
    //   uStormProgress.value = this.guiController.uStormProgress
    //   uForce.value = this.guiController.uForce
    //   uProj.value = this.guiController.uProj
    //   uAlpha.value = this.guiController.uAlpha
    //   uTransitionProgress.value = this.guiController.uTransitionProgress
    //   uAmplitude.value = this.guiController.uAmplitude
    //   uStripMin.value = this.guiController.uStripMin
    //   uStripForce.value = this.guiController.uStripForce
    //   uBend.value = this.guiController.uBend
    //   uTest.value = this.guiController.uTest
    // }

    handleResize = () => {
        this.material.uniforms.uPixelRatio.value = ResizeManager.dpr
        this.material.uniforms.uScaleHeightPointSize.value = (ResizeManager.dpr * ResizeManager.height) / 2
    }

    render(deltaTime) {
        this.material.uniforms.uTime.value += deltaTime / 500.0
        // CameraController.camera.updateProjectionMatrix()
        // this.material.uniforms.projectionMatrix.value = CameraController.camera.projectionMatrix

        // console.log(this.index)
        // if (!DEBUG.mode && !.active) {
        //   // this.fogAlpha()
        // }
    }

    // fogAlpha() {
    //   const distance = this.object3d.position.distanceTo(CameraController.cameraBox.position)
    //   const percent = (clamp(distance, 100, 150) - 100) / 50
    //   this.material.uniforms.uMaxAlpha.value = clamp(1 - percent * 0.5, 0.68, 0.72)
    // }

    toggleZoom(goToZoom) {
        this.zoomed = goToZoom
        this.material.uniforms.uForce.value = goToZoom ? MAX_FORCE : MIN_FORCE

        if (goToZoom) {
            this.plane.scale.set(this.width * 0.93, this.height * 0.9, 1)
        } else {
            this.plane.scale.set(this.width, this.height, 1)
        }
    }

    placeOnRoad(context, addMesh = true) {
        const offsetY = 0

        const mesh = this.object3d
        mesh.index = context.index
        mesh.position.copy(context.position)
        mesh.position.y += PROJECT_STICK_HEIGHT + offsetY
        mesh.lookAt(context.lookAt)
        mesh.position.y += this.height / 2 / 2
        // translate on left side
        const margin = 4
        const vec3 = new Vector3()
        vec3.subVectors(context.lookAt, mesh.position).normalize()
        vec3.applyAxisAngle(new Vector3(0, 1, 0), degToRad(context.directionCenter * 90))

        vec3.multiplyScalar(this.width / 2 + margin)
        mesh.position.add(vec3)

        // position meshHelper for camera position
        const meshHelper = new Mesh(SPHERE_GEO, SPHERE_MAT)
        const vec3Helper = new Vector3()
        const vec3HelperMargin = new Vector3()
        const scale = 55
        meshHelper.position.copy(mesh.position)
        vec3Helper.subVectors(context.lookAt, mesh.position).normalize()
        vec3Helper.addScaledVector(vec3Helper, scale)
        meshHelper.position.add(vec3Helper)

        const sideOffsetScale = 13

        vec3HelperMargin.subVectors(context.lookAt, mesh.position).normalize()
        vec3HelperMargin.applyAxisAngle(new Vector3(0, 1, 0), degToRad(context.directionCenter * 90))
        meshHelper.position.addScaledVector(vec3HelperMargin, sideOffsetScale)

        context.zoomPosition = meshHelper.position
        const vec3HelperLookAt = new Vector3()
        vec3HelperLookAt.copy(mesh.position)
        vec3HelperLookAt.addScaledVector(vec3HelperMargin, sideOffsetScale)

        context.zoomLookAt = vec3HelperLookAt

        // context.object3d.add(meshHelper)

        if (addMesh) {
            context.object3d.add(mesh)
        }
    }
}