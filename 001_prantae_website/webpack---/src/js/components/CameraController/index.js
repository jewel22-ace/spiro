// import GUI from '../Gui'
import ScrollManager from '~managers/ScrollManager'
import TemplateManager from '~managers/TemplateManager'
import CameraTrail from './CameraTrail'
import CameraLookAtTrail from './CameraLookAtTrail'
import {
    mode,
    toggle_helpers
} from '~data/debug'
import {
    degToRad,
    radToDeg
} from '~utils/three'
import {
    lerp
} from '~utils/math'
import {
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PerspectiveCamera,
    SphereGeometry
} from 'three'
import {
    TimelineLite
} from 'gsap'
import {
    MOUSE_MOVE,
    GO_TO_PROJECT
} from '~constants/'
import {
    clamp
} from '../../utils/math'
// import * as THREE from 'three'
import {
    DELAY_INTRO_START_CAMERA,
    RENDER_ORDER_OVERLAY,
    RENDER_ORDER_S_TITLES,
    SCROLL,
    TRANSITION_MENU_MAX_DURATION,
} from '../../constants'
import RaycasterManager from '../../managers/RaycasterManager'
import ResizeManager from '../../managers/ResizeManager'
import createCustomEvent from '../../utils/createCustomEvent'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'

const INIT_POS_Z = 160 // 40
const FOV = 45
const NEAR_PLANE = 0.1
const FAR_PLANE = 10000
const OFFSET_X_VIEW = 0

const INTRO_POSITION = {
    x: -250,
    y: 700,
    z: 400,
}

const INTRO_ROTATION = {
    x: 2.08994244104142,
    y: 0.3006848912268313,
    z: -2.663408301288528,
}

const OVERVIEW_POSITION = {
    x: 0,
    y: 700,
    z: 0,
}

const LISTVIEW_POSITION = {
    x: 0,
    y: 400,
    z: 350,
}

const ABOUT_ROAD_POSITION = {
    x: -113.08831515877934,
    y: 4.140972751769578,
    z: 49.46062049598492,
}

const ABOUT_ROAD_ROTATION = {
    x: 0.16969005233767223,
    y: -0.792901791522309,
    z: 0.12145895589857225,
}

const ABOUT_SCROLL_PROGRESS = 0.8607816995298575

const INC_RAF = 18 // replacing deltaTIme by this for issue if changong tabs

class CameraController {
    constructor() {
        this.rotateForceX = 3.5
        this.rotateForceY = 7.5
        this.coefRotate = 0.05 / 15
        this.coefMoveAlong = 0.1 / 15
        this.targetRotateX = 0
        this.targetRotateY = 180
        this.canMove = true
        this.canMoveAlongTrail = true
        this.targetProgress = 0
        this.lastProgress = 0
    }

    init(scene) {
        const aspectRatio = window.innerWidth / window.innerHeight
        this.initGUI()

        this.scene = scene

        // this.axesHelper = new THREE.AxesHelper(3)
        // this.scene.add(this.axesHelper)

        this.trail = new CameraTrail(this.scene)
        this.trailLookAt = new CameraLookAtTrail(this.scene)

        // // Debug
        // const geometry1 = new THREE.BufferGeometry().setFromPoints(this.trail.getPoints(750))
        // const material1 = new THREE.LineBasicMaterial({ color: 0x00ff00 })
        // // Create the final object to add to the scene
        // const curveObject1 = new THREE.Line(geometry1, material1)
        // this.scene.add(curveObject1)

        // const geometry = new THREE.BufferGeometry().setFromPoints(this.trailLookAt.getPoints(750))
        // const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
        // // Create the final object to add to the scene
        // const curveObject = new THREE.Line(geometry, material)
        // this.scene.add(curveObject)

        if (toggle_helpers) {
            this.createLookAtDebug()
        }

        if (mode) {
            this.camera = new PerspectiveCamera(FOV, aspectRatio, NEAR_PLANE, FAR_PLANE)
            this.camera.position.y = mode ? OVERVIEW_POSITION.y : 0
            this.camera.position.z = OVERVIEW_POSITION.z
            this.camera.lookAt(0, 0, 0)
            this.camera.updateProjectionMatrix()
        } else {
            this.cameraBox = new Object3D()
            this.cameraBox.position.y = mode ? OVERVIEW_POSITION.y : 0
            this.cameraBox.position.z = INIT_POS_Z
            // copy rotation of first position on the website
            const targetPosition = this.trail.getPoint(0)
            const targetLookAt = this.trailLookAt.getPoint(this.guiController.lookAtProgress)

            this.cameraBox.position.copy(targetPosition)
            this.cameraBox.lookAt(targetLookAt)

            this.camera = new PerspectiveCamera(FOV, aspectRatio, NEAR_PLANE, FAR_PLANE)
            this.camera.rotation.x = degToRad(this.targetRotateX)
            this.camera.rotation.y = degToRad(this.targetRotateY)
            this.cameraBox.add(this.camera)

            this.lastPositionOnRoad = this.cameraBox.position.clone()
            this.lastRotationOnRoad = this.cameraBox.rotation.clone()
        }

        this.lastTrailPosition = this.cameraBox ? .position.clone()
        this.lastTrailLookAt = this.trailLookAt.getPoint(ScrollManager.progress + this.guiController.lookAtProgress)

        if (!ResizeManager.isTouch) {
            window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
        }
        window.addEventListener(GO_TO_PROJECT, e => {
            const {
                zoomPosition,
                zoomLookAt,
                fromMenuView
            } = e.detail
            this.goToProject(zoomPosition, zoomLookAt, fromMenuView)
        })
    }

    addSectionTitle(sectionTitles) {
        this.sectionTitles = sectionTitles

        if (!mode) {
            // Add titles sections
            sectionTitles.forEach(el => {
                el.mesh.position.z = -100
                // always render in front of the rest
                el.mesh.material.depthTest = false
                el.mesh.material.depthWrite = false
                el.mesh.renderOrder = RENDER_ORDER_S_TITLES

                this.camera.add(el.mesh)
            })
        }
    }

    addOverlay(overlay) {
        this.overlay = overlay

        // Add overlay
        this.overlay.mesh.position.z = -this.overlay.distance
        this.overlay.mesh.material.depthTest = false
        this.overlay.mesh.material.depthWrite = false
        this.overlay.mesh.renderOrder = RENDER_ORDER_OVERLAY
        this.camera.add(this.overlay.mesh)
    }

    addListFlag(listFlag) {
        this.listFlag = listFlag
        this.listFlag.object3d.position.z = -60
        this.listFlag.object3d.position.x = -2
        this.listFlag.object3d.rotation.y += degToRad(-15)
        this.camera.add(this.listFlag.object3d)
    }

    initGUI() {
        // gui
        this.guiController = {
            lookAtProgress: 0.03,
            axeHelpX: 0.0,
            axeHelpY: 0.0,
            axeHelpZ: 0.0,
        }

        // const folder = GUI.addFolder('Camera')

        // folder.add(this.guiController, 'lookAtProgress', 0, 1).step(0.01)
        // folder
        //   .add(this.guiController, 'axeHelpX', -500, 500)
        //   .step(1)
        //   .onChange(this.guiChange)
        // folder
        //   .add(this.guiController, 'axeHelpY', -500, 500)
        //   .step(1)
        //   .onChange(this.guiChange)
        // folder
        //   .add(this.guiController, 'axeHelpZ', -500, 500)
        //   .step(1)
        //   .onChange(this.guiChange)
    }

    createLookAtDebug() {
        const debugMaterial = new MeshBasicMaterial({
            color: 0xffff00
        })
        // get meshes

        const geometry = new SphereGeometry(0.5, 32, 32)
        this.lookAtDebug = new Mesh(geometry, debugMaterial)

        // this.scene.add(this.lookAtDebug)
    }

    handleMouseMove = e => {
        if (!this.canMove) return
        const {
            x,
            y
        } = e.detail
        const forceX = this.rotateForceX
        const forceY = this.rotateForceY

        this.targetRotateX = -y * forceX
        this.targetRotateY = -x * forceY + 180
    }

    render(now, deltaTime) {
        if (!mode) {
            if (!ResizeManager.isTouch) {
                this.mouseMoveCamera(deltaTime)
            }

            if (!this.onZoomProject && this.canMoveAlongTrail) {
                this.moveAlongTrail(deltaTime)
            }
        }
    }

    mouseMoveCamera(deltaTime) {
        if (this.camera.rotation.x !== degToRad(this.targetRotateX)) {
            this.camera.rotation.x = lerp(this.camera.rotation.x, degToRad(this.targetRotateX), this.coefRotate * INC_RAF)
        }

        if (this.camera.rotation.y !== degToRad(this.targetRotateY)) {
            this.camera.rotation.y = lerp(this.camera.rotation.y, degToRad(this.targetRotateY), this.coefRotate * INC_RAF)
            this.camera.rotation.y = degToRad(clamp(radToDeg(this.camera.rotation.y), 170, 190))
        }
    }

    moveAlongTrail(deltaTime) {
        // move
        // t = (point number) / (number of points - 1)
        const {
            progress,
            targetProgress,
            autoScrolled
        } = ScrollManager

        let targetPosition
        let targetLookAt
        let finalProgress = targetProgress

        if (autoScrolled) {
            finalProgress = progress
        }

        if (!isNaN(finalProgress) && finalProgress >= 0 && finalProgress <= 1) {
            targetPosition = this.trail.getPoint(finalProgress)

            let lookAtProgress = (finalProgress + this.guiController.lookAtProgress) % 1
            targetLookAt = this.trailLookAt.getPoint(lookAtProgress)

            this.cameraBox.position.copy(targetPosition)
            this.lookAtDebug.position.copy(targetLookAt)
            this.cameraBox.lookAt(targetLookAt)

            this.lastPositionOnRoad = this.cameraBox.position.clone()
            this.lastRotationOnRoad = this.cameraBox.rotation.clone()

            this.lastProgress = progress
        }
    }

    goToProject(position, lookAt, fromMenuView) {
        if (this.timelineBackRoad) this.timelineBackRoad.kill()
        // block scroll
        document.body.classList.add('no-scroll')
        this.onZoomProject = true
        const initLookAt = this.trailLookAt.getPoint(ScrollManager.progress + this.guiController.lookAtProgress)
        this.canMove = true

        SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA)

        const duration = fromMenuView ? 3 : 2

        const tl = new TimelineLite()

        if (fromMenuView) {
            const offsetYProject = 50

            tl.fromTo(
                this.cameraBox.position, {
                    x: position.x,
                    y: position.y + offsetYProject,
                    z: position.z,
                }, {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    ease: 'expo.out',
                    duration,
                },
                0,
            )

            tl.fromTo(
                initLookAt, {
                    x: lookAt.x,
                    y: lookAt.y + offsetYProject,
                    z: lookAt.z,
                }, {
                    x: lookAt.x,
                    y: lookAt.y,
                    z: lookAt.z,
                    ease: 'expo.out',
                    duration,
                    onUpdate: () => {
                        this.cameraBox.lookAt(initLookAt)
                    },
                },
                0,
            )
        } else {
            tl.to(
                this.cameraBox.position, {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    ease: 'expo.out',
                    duration,
                },
                0,
            )

            tl.to(
                initLookAt, {
                    x: lookAt.x,
                    y: lookAt.y,
                    z: lookAt.z,
                    ease: 'expo.out',
                    duration,
                    onUpdate: () => {
                        this.cameraBox.lookAt(initLookAt)
                    },
                },
                0,
            )

            // save last trail position
            this.lastTrailPosition = this.cameraBox.position.clone()
            this.lastTrailLookAt = initLookAt.clone()
            this.lastProjectLookAt = lookAt.clone()
        }
    }

    goBackRoad() {
        const duration = 1.2

        SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA)

        this.timelineBackRoad = new TimelineLite({
            onComplete: () => {
                this.onZoomProject = false
                document.body.classList.remove('no-scroll')
            },
        })

        this.timelineBackRoad.to(
            this.cameraBox.position, {
                x: this.lastTrailPosition.x,
                y: this.lastTrailPosition.y,
                z: this.lastTrailPosition.z,
                ease: 'quad.out',
                duration,
            },
            0,
        )

        this.timelineBackRoad.to(
            this.lastProjectLookAt, {
                x: this.lastTrailLookAt.x,
                y: this.lastTrailLookAt.y,
                z: this.lastTrailLookAt.z,
                ease: 'quad.out',
                duration,
                onUpdate: () => {
                    this.cameraBox.lookAt(this.lastProjectLookAt)
                },
            },
            0,
        )
    }

    // guiChange = () => {
    //   this.axesHelper.position.set(this.guiController.axeHelpX, this.guiController.axeHelpY, this.guiController.axeHelpZ)
    // }

    toListview(onComplete) {
        this.canMoveAlongTrail = false
        if (!ResizeManager.isTouch) {
            this.targetRotateX = -2.4626
            this.targetRotateY = 180.018
            this.canMove = false
        }

        const tl = new TimelineLite({
            onComplete: () => {
                onComplete()
            },
        })

        const duration = 3
        const durationRot = 3

        const targetPosition = { ...LISTVIEW_POSITION
        }
        // keep last camera zRota avoiding +180 z rotation issues
        const zRota = this.lastRotationOnRoad.z >= 0 ? degToRad(180) : degToRad(-180)
        const targetRotation = {
            x: degToRad(130),
            y: 0,
            z: zRota,
        }

        tl.add(() => {
            SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA_SLOW)
        })

        if (TemplateManager.menu.cameFromView) {
            const offsetYProject = 300
            tl.fromTo(
                this.cameraBox.position, {
                    x: targetPosition.x,
                    y: targetPosition.y - offsetYProject,
                    z: targetPosition.z,
                }, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    ease: 'expo.out',
                    duration,
                },
                0,
            )

            tl.fromTo(
                this.cameraBox.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                }, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                    duration: durationRot,
                    ease: 'expo.out',
                },
                0,
            )
        } else {
            tl.to(
                this.cameraBox.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration,
                    ease: 'quart.out',
                },
                0,
            )

            tl.to(
                this.cameraBox.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                    duration: durationRot,
                    ease: 'quart.out',
                },
                0,
            )
        }

        this.tlMenuView = tl
    }

    toOverview(onComplete) {
        this.tlDefaultView ? .kill()
        if (!ResizeManager.isTouch) {
            this.canMove = true
        }
        this.canMoveAlongTrail = false

        const targetPosition = { ...OVERVIEW_POSITION
        }
        targetPosition.x += OFFSET_X_VIEW

        const tl = new TimelineLite({
            onComplete: () => {
                // if (!ResizeManager.isTouch) {
                //   this.canMove = true
                // }
                onComplete()
            },
        })
        const duration = 4
        const durationRot = 3

        // shadow item
        // keep last camera zRota avoiding +180 z rotation issues
        const zRota = this.lastRotationOnRoad.z >= 0 ? degToRad(180) : degToRad(-180)
        const targetRotation = {
            x: degToRad(90),
            y: 0,
            z: zRota,
        }

        tl.add(() => {
            SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA_SLOW)
        })

        if (TemplateManager.menu.cameFromView) {
            const offsetYProject = 300
            tl.fromTo(
                this.cameraBox.position, {
                    x: targetPosition.x,
                    y: targetPosition.y - offsetYProject,
                    z: targetPosition.z,
                }, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    ease: 'expo.out',
                    duration,
                },
                0,
            )

            tl.fromTo(
                this.cameraBox.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                }, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                    duration: durationRot,
                    ease: 'expo.out',
                },
                0,
            )
        } else {
            tl.to(
                this.cameraBox.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration,
                    ease: 'quart.out',
                },
                0,
            )

            tl.to(
                this.cameraBox.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    z: targetRotation.z,
                    duration: durationRot,
                    ease: 'expo.out',
                },
                0,
            )
        }

        this.tlMenuView = tl
    }

    toRoadview(onComplete, type) {
        this.tlMenuView ? .kill()
        this.targetRotateX = 0
        this.targetRotateY = degToRad(180)

        const updateScrollToAbout = () => {
            document.body.classList.remove('no-scroll')
            ScrollManager.progress = ABOUT_SCROLL_PROGRESS
            ScrollManager.targetProgress = ABOUT_SCROLL_PROGRESS
            ScrollManager.lastScroll = ABOUT_SCROLL_PROGRESS
            window.scrollTo(0, ScrollManager.maxHeight * ABOUT_SCROLL_PROGRESS)
        }

        if (type === 'about') {
            this.lastPositionOnRoad = ABOUT_ROAD_POSITION
            this.lastRotationOnRoad = ABOUT_ROAD_ROTATION
        }

        const tl = new TimelineLite({
            onComplete: () => {
                this.onZoomProject = false
                this.canMoveAlongTrail = true
                this.canMove = true

                onComplete()
            },
        })
        const duration = 3
        const durationRot = 3

        tl.add(() => {
            SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA_SLOW)
        })

        tl.to(
            this.cameraBox.position, {
                x: this.lastPositionOnRoad.x,
                y: this.lastPositionOnRoad.y,
                z: this.lastPositionOnRoad.z,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        tl.to(
            this.cameraBox.rotation, {
                x: this.lastRotationOnRoad.x,
                y: this.lastRotationOnRoad.y,
                z: this.lastRotationOnRoad.z,
                duration: durationRot,
                ease: 'expo.out',
            },
            0,
        )

        tl.add(() => {
            if (type === 'about') {
                updateScrollToAbout()
            } else {
                document.body.classList.remove('no-scroll')
                const scrollY = window.scrollY
                window.dispatchEvent(createCustomEvent(SCROLL, {
                    scrollY
                }))
            }
        }, duration - 0.4)

        tl.add(() => {
            this.onZoomProject = false
            this.canMoveAlongTrail = true
            this.canMove = true
        }, duration - 0.2)

        this.tlDefaultView = tl
    }

    introToDefaultView() {
        if (!this.cameraBox) return
        document.body.classList.add('no-scroll')
        this.canMoveAlongTrail = false
        const targetPosition = this.trail.getPoint(0)
        // Set init Pos
        ScrollManager.progress = 1
        this.cameraBox.position.set(INTRO_POSITION.x, INTRO_POSITION.y, INTRO_POSITION.z)

        this.targetRotateX = 0
        this.targetRotateY = degToRad(180)
        this.camera.rotation.x = this.targetRotateX
        this.camera.rotation.y = this.targetRotateY

        this.cameraBox.rotation.set(INTRO_ROTATION.x, INTRO_ROTATION.y, INTRO_ROTATION.z)

        this.canMove = true

        const tl = new TimelineLite({
            onComplete: () => {
                this.onZoomProject = false
                this.canMoveAlongTrail = true
                document.body.classList.remove('no-scroll')

                RaycasterManager.updateObserver({})
                ScrollManager.introFinished = true
                TemplateManager.showScrollText()
            },
            paused: false,
            delay: DELAY_INTRO_START_CAMERA,
        })

        const duration = TRANSITION_MENU_MAX_DURATION
        const durationRot = TRANSITION_MENU_MAX_DURATION

        tl.add(() => {
            SoundManager.trigger(SOUNDS_CONST.MVT_CAMERA_SLOW)
        })

        tl.to(
            this.cameraBox.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration,
                ease: 'quart',
            },
            0,
        )

        tl.to(
            this.cameraBox.rotation, {
                x: this.lastRotationOnRoad.x,
                y: this.lastRotationOnRoad.y,
                z: this.lastRotationOnRoad.z,
                duration: durationRot,
                ease: 'quart',
            },
            0,
        )

        tl.add(() => {
            this.sectionTitles[0].animate()
        }, 1.5)

        tl.add(() => {
            ScrollManager.progress = 0
        }, 2)
    }
}

export default new CameraController()