// import GUI from '../Gui'
import Flag from './Flag'
import LinesManager from '~managers/LinesManager'
import PROJECTS from '~data/projects'
import LABS from '~data/labs'
import {
    BACK_ON_ROAD,
    PORTIONS_PROJECTS,
    PORTIONS_LABS,
    SIDEBAR_MOUSEENTER,
    SIDEBAR_MOUSELEAVE,
    SWITCH_VIEW,
    GO_TO_PROJECT,
} from '~constants/index'
import {
    degToRad
} from '~utils/three'
import {
    Vector3
} from 'three'
import ScrollManager from '../../managers/ScrollManager'
import CameraController from '../CameraController'
import TemplateManager from '../../managers/TemplateManager'
import TouchTexture from './ParticlesFlag/TouchTexture'
import RaycasterManager from '../../managers/RaycasterManager'

import {
    DELAY_MENU_TO_PROJECT,
    GO_TO_MENU_FROM_PROJECT,
    GO_TO_PROJECT_FROM_MENU,
    LISTVIEW_TYPE,
    OVERVIEW_TYPE,
    ROAD_TYPE,
    SCROLL,
} from '../../constants'
import createCustomEvent from '../../utils/createCustomEvent'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'

export default class Flags {
    guiController = {
        amplitude: 0.1,
        waveDistance: 23743,
        waveClamping: -50000,
        time: 0,
    }
    flags = []
    scene = null
    currentIntersect = false
    hoverableObjects = []
    flagsRendered = []
    canTouchFlagPlane = true

    constructor(scene) {
        this.scene = scene
        this.touch = new TouchTexture()

        // this.initGUI()

        // this.particleFlag = new ParticlesFlag(scene)
        this.initProjects()
        this.initLabs()
        this.initListFlag()

        window.addEventListener(SCROLL, this.handleScroll)
        // if (ResizeManager.isTouch) {
        //   const el = document.body
        //   const mc = new Hammer.Manager(el)

        //   mc.add(new Hammer.Tap())

        //   mc.on('tap', this.handleClick)
        // } else {
        document.body.addEventListener('click', this.handleClick)
        // }

        window.addEventListener(BACK_ON_ROAD, this.backOnRoad)
        window.addEventListener(GO_TO_MENU_FROM_PROJECT, this.goToMenuFromProject)
        window.addEventListener(SIDEBAR_MOUSEENTER, this.menuMouseenter)
        window.addEventListener(SIDEBAR_MOUSELEAVE, this.menuMouseleave)
        window.addEventListener(SWITCH_VIEW, this.switchView)
        window.addEventListener(GO_TO_PROJECT_FROM_MENU, e => {
            const {
                index,
                view
            } = e.detail
            if (view === LISTVIEW_TYPE) {
                this.flags[index].fadeIn(true)
            }
            this.goToProject(index, true)
        })

        setTimeout(() => {
            this.flags[0].fadeIn()
            this.flagsRendered = this.flags.filter(el => el.isVisible)
            RaycasterManager.updateObserver({})
        }, 1500)
    }

    initProjects() {
        const inc = PORTIONS_PROJECTS / PROJECTS.length
        const startOffset = inc
        const offsetRadius = 55
        const radius = 100
        this.scrollValue = startOffset

        const {
            points
        } = LinesManager.mainRoad

        // create trail to help positioning elements

        // Font

        PROJECTS.forEach((data, index) => {
            const {
                angle,
                position: pointPosition,
                center
            } = points[Math.round(points.length * this.scrollValue)]
            let directionCenter = points[Math.round(points.length * this.scrollValue)].directionCenter

            // use that to change element to opposite way
            let dirOppositeWay = 1
            if (index === 2 || index === 5) {
                dirOppositeWay = -1
                directionCenter *= -1
            }

            const x = Math.cos(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius) + center.x
            const z = Math.sin(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius)
            const position = new Vector3(x, pointPosition.y, z)

            // meshLine
            // lookAt a little bit before the current point
            const lookAt = LinesManager.mainTrail.getPoint(Math.max(0, this.scrollValue - 0.02))

            const project = new Flag({
                position,
                index,
                guiController: this.guiController,
                lookAt,
                directionCenter,
                data,
                scrollValue: this.scrollValue,
                touch: this.touch,
                type: 'project',
                flagIndex: index,
            })

            if (TemplateManager.menu.active) {
                project.toOverview()
            }

            this.flags.push(project)
            this.scene.add(project.object3d)
            // detect hoverable objects

            if (index !== PROJECTS.length - 1) {
                this.scrollValue += inc
            }
        })

        // LABS
    }

    initLabs() {
        const inc = (PORTIONS_LABS - PORTIONS_PROJECTS) / LABS.length
        const offsetRadius = 55
        const radius = 100

        // add offset of the current section
        this.scrollValue += inc

        const {
            points
        } = LinesManager.mainRoad
        // create trail to help positioning elements
        // Font

        LABS.forEach((data, index) => {
            const {
                angle,
                position: pointPosition,
                center
            } = points[Math.round(points.length * this.scrollValue)]
            let directionCenter = points[Math.round(points.length * this.scrollValue)].directionCenter

            // use that to change element to opposite way
            let dirOppositeWay = 1
            if (index === 1) {
                dirOppositeWay = -1
                directionCenter *= -1
            }

            const x = Math.cos(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius) + center.x
            const z = Math.sin(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius)
            const position = new Vector3(x, pointPosition.y, z)

            // meshLine
            // lookAt a little bit before the current point
            const lookAt = LinesManager.mainTrail.getPoint(Math.max(0, this.scrollValue - 0.02))

            const lab = new Flag({
                type: 'lab',
                position,
                index,
                guiController: this.guiController,
                lookAt,
                directionCenter,
                data,
                scrollValue: this.scrollValue,
                touch: this.touch,
                flagIndex: index + PROJECTS.length,
            })

            if (TemplateManager.menu.active) {
                lab.toOverview()
            }

            this.flags.push(lab)
            this.scene.add(lab.object3d)

            this.scrollValue += inc
        })
    }

    initListFlag() {
        const position = new Vector3(0, 0, 0)
        const lookAt = new Vector3(0, 0, 0)
        const index = 0
        this.listFlag = new Flag({
            type: 'list',
            position,
            index,
            guiController: this.guiController,
            lookAt,
            directionCenter: 1,
            touch: this.touch,
        })

        // this.scene.add(this.listFlag.object3d)
    }

    // initGUI() {
    //   // gui

    //   const folder = GUI.addFolder('Flags')
    //   folder.add(this.guiController, 'amplitude', 0.01, 10.0).onChange(this.guiChange)
    //   folder.add(this.guiController, 'waveDistance', 0, 50000.0).onChange(this.guiChange)
    //   folder.add(this.guiController, 'waveClamping', -50000, 50000.0).onChange(this.guiChange)
    //   folder.add(this.guiController, 'time', 0, 1000.0).onChange(this.guiChange)
    //   // folder.open()
    // }

    // guiChange = () => {
    //   for (let i = 0; i < this.flags.length; i++) {
    //     const { shader } = this.flags[i]
    //     this.flags[i].canUpdateAmplitude = false
    //     shader.uniforms.amplitude.value = this.guiController.amplitude
    //     shader.uniforms.waveDistance.value = this.guiController.waveDistance
    //     shader.uniforms.waveClamping.value = this.guiController.waveClamping
    //   }
    // }

    handleScroll = () => {
        const marginFront = 0.1
        const marginBehind = 0.01
        for (let i = 0; i < this.flags.length; i++) {
            const flag = this.flags[i]

            // specific condition when we're at the end of the road loop
            const aboutCondition =
                ScrollManager.progress + marginFront > 1 && (ScrollManager.progress + marginFront) % 1 > flag.scrollValue
            if (
                aboutCondition ||
                (ScrollManager.progress + marginFront > flag.scrollValue &&
                    ScrollManager.progress - flag.scrollValue < marginBehind)
            ) {
                if (!flag.isVisible) {
                    flag.fadeIn()
                    this.flagsRendered = this.flags.filter(el => el.isVisible)
                    RaycasterManager.updateObserver({})
                }
            } else {
                let isFast = ScrollManager.progress - flag.scrollValue < marginBehind
                if (i === 0) {
                    isFast = true
                }
                if (flag.isVisible) {
                    flag.fadeOut(!isFast)
                    this.flagsRendered = this.flags.filter(el => el.isVisible)
                    RaycasterManager.updateObserver({})
                }
            }
        }
    }

    handleClick = e => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        RaycasterManager.mouse.x = x
        RaycasterManager.mouse.y = y

        RaycasterManager.updateCurrentIntersect({
            x,
            y
        })

        let clickSound = false

        if (
            RaycasterManager.currentIntersect &&
            this.lastClickedFlag &&
            RaycasterManager.currentIntersect.object.name === `project-${this.lastClickedFlag.index}-next`
        ) {
            // click on next arrows
            this.lastClickedFlag.goNext()
            clickSound = true
        } else if (
            RaycasterManager.currentIntersect &&
            this.lastClickedFlag &&
            RaycasterManager.currentIntersect.object.name === `project-${this.lastClickedFlag.index}-prev`
        ) {
            // click on prev arrows
            this.lastClickedFlag.goPrev()
            clickSound = true
        } else if (RaycasterManager.currentIntersect && RaycasterManager.currentIntersect.object.flagIndex > -1) {
            // Click on project from road
            if (!CameraController.onZoomProject && TemplateManager.menu.canSwitch) {
                const {
                    flagIndex
                } = RaycasterManager.currentIntersect.object
                if (TemplateManager.menu.active) {
                    TemplateManager.menu.toRoadview({
                        goToProject: true,
                        type: this.flags[flagIndex].type,
                        index: flagIndex
                    })
                } else {
                    this.goToProject(flagIndex)
                }

                SoundManager.trigger(SOUNDS_CONST.CLICK)

                clickSound = true
            }
            if (CameraController.onZoomProject || TemplateManager.menu.active) return
        } else if (!TemplateManager.menu.active && TemplateManager.menu.canSwitch) {
            if (TemplateManager.menu.cameFromView) {
                const view = TemplateManager.menu.cameFromView
                window.dispatchEvent(createCustomEvent(GO_TO_MENU_FROM_PROJECT, {
                    view
                }))
            } else {
                window.dispatchEvent(createCustomEvent(BACK_ON_ROAD))
            }
        }

        if (clickSound) {
            SoundManager.trigger(SOUNDS_CONST.CLICK)
        }
    }

    goToProject = (index, fromMenuView = false) => {
        TemplateManager.hideScrollText()
        this.onZoomProject = true
        const {
            zoomPosition,
            zoomLookAt,
            directionCenter,
            type
        } = this.flags[index]
        window.dispatchEvent(
            createCustomEvent(GO_TO_PROJECT, {
                directionCenter,
                flagIndex: index,
                type,
                zoomPosition,
                zoomLookAt,
                fromMenuView,
            }),
        )

        this.flags[index].toggleZoom(true)
        this.lastClickedFlag = this.flags[index]
        this.flagsRendered = [this.flags[index]]

        if (fromMenuView) {
            if (!this.flags[index].isVisible) {
                this.flagFromMenuNotVisible = this.flags[index]
            }
            this.flags[index].isVisible = true

            this.flags[index].loadTextureFirst(
                this.flags[index].particleFlag.textures[this.flags[index].particleFlag.sliderIndex],
            )
        }
        RaycasterManager.updateObserver({})
    }

    goToMenuFromProject = e => {
        if (!CameraController.onZoomProject) return
        const {
            view
        } = e.detail

        if (view === OVERVIEW_TYPE) {
            TemplateManager.menu.toOverview()
        } else if (view === LISTVIEW_TYPE) {
            TemplateManager.menu.toListview()
        }

        setTimeout(() => {
            TemplateManager.transitionOutProject()
            CameraController.onZoomProject = false

            if (this.lastClickedFlag) {
                this.lastClickedFlag.toggleZoom(false)
                this.lastClickedFlag.flagToCircle()
            }

            RaycasterManager.updateObserver({
                view: OVERVIEW_TYPE
            })
        }, DELAY_MENU_TO_PROJECT * 1000)
    }

    backOnRoad = () => {
        if (!CameraController.onZoomProject) return
        this.flagsRendered = this.flags.filter(el => el.isVisible)

        // Click outside project if already zoomed
        TemplateManager.transitionOutProject()
        CameraController.goBackRoad()

        if (this.lastClickedFlag) {
            this.lastClickedFlag.toggleZoom(false)
        }
        RaycasterManager.updateObserver({})
    }

    render(now, deltaTime) {
        for (let i = 0; i < this.flagsRendered.length; i++) {
            this.flagsRendered[i].render(now, deltaTime)
        }

        if (this.listFlag) {
            this.listFlag.render(now, deltaTime)
        }

        this.hoverObjects()
    }

    hoverObjects() {
        if (RaycasterManager.isReady) {
            this.touch.update()

            const {
                currentIntersect,
                intersects
            } = RaycasterManager

            if (intersects.length) {
                // console.log(intersects)
                // hover particleFlagPlane
                if (
                    currentIntersect.object.name === 'particleFlagPlane' &&
                    this.flags[currentIntersect.object.flagIndex].isVisible
                ) {
                    const flag = this.flags[currentIntersect.object.flagIndex]
                    if (!TemplateManager.menu.active) {
                        // if effect on flag on over view
                        if (this.lastFlagIntersect && this.lastFlagIntersect !== flag) {
                            this.touch.reset()
                            this.lastFlagIntersect.particleFlag.material.uniforms.uTouch.value = null
                        }
                        setTimeout(() => {
                            flag.particleFlag.material.uniforms.uTouch.value = this.touch.texture
                            this.touch.addTouch(intersects[0].uv)
                        }, 0)
                    }

                    this.isTouchingFlagPlane = true
                    this.lastFlagIntersect = flag
                }

                for (let i = 0; i < intersects.length; i++) {
                    const el = intersects[i]
                    if (el.object.name === 'particleFlagCircle') {
                        if (
                            this.lastCircleFlagIntersect !== this.flags[currentIntersect.object.flagIndex] ||
                            (this.lastCircleFlagIntersect === this.flags[currentIntersect.object.flagIndex] &&
                                !this.lastCircleFlagIntersect.circleToFlagAnimated)
                        ) {
                            const flag = this.flags[currentIntersect.object.flagIndex]
                            if (this.lastCircleFlagIntersect !== flag) {
                                flag.circleToFlag()
                                TemplateManager.menu.overviewProjects.updateText(currentIntersect.object.flagIndex)
                                this.lastCircleFlagIntersect = flag
                                if (flag.type === 'project') {
                                    ScrollManager.changeColors(0, true)
                                } else if (flag.type === 'lab') {
                                    ScrollManager.changeColors(1, true)
                                }
                            }
                        }
                    }
                }
            } else if (currentIntersect) {
                // if not touch anything but smth has been touch before
                if (this.isTouchingFlagPlane) {
                    this.isTouchingFlagPlane = false

                    if (!TemplateManager.menu.active) {
                        const flags = this.flags.filter(el => el !== this.lastFlagIntersect)
                        flags.forEach(el => (el.particleFlag.material.uniforms.uTouch.value = null))
                    }
                }
            } else if (this.lastCircleFlagIntersect) {
                // if not touch anything but last flag intersect
                if (!this.lastCircleFlagIntersect.flagToCircleAnimated && !this.preventRaycasterLeave) {
                    this.lastCircleFlagIntersect.flagToCircle()
                    // TemplateManager.menu.sidebar.items[this.lastCircleFlagIntersect.flagIndex].leave()
                    TemplateManager.menu.overviewProjects.removeText()
                    this.lastCircleFlagIntersect = null
                }
            }
        }
    }

    menuMouseenter = e => {
        const flag = this.flags[e.detail.index]
        if (this.lastCircleFlagIntersect === flag) {
            this.preventRaycasterLeave = true
            flag.circleToFlagAnimated = false
        }

        flag.circleToFlag()
    }

    menuMouseleave = e => {
        this.flags[e.detail.index].flagToCircle()
        this.lastCircleFlagIntersect = false
        this.preventRaycasterLeave = false
    }

    switchView = e => {
        const {
            type,
            goToProject,
            index
        } = e.detail

        if (type === OVERVIEW_TYPE) {
            this.flagsRendered = this.flags
            this.listFlag.fadeOut()

            if (this.flagFromMenuNotVisible) {
                // remove visibility after flag has been clicked from menu
                this.flagFromMenuNotVisible.isVisible = false
            }
        } else if (type === ROAD_TYPE) {
            this.listFlag.fadeOut()
            this.flagsRendered = this.flags.filter(el => el.isVisible)
        } else if (type === LISTVIEW_TYPE) {
            this.listFlag.fadeIn()
        }

        this.flags.forEach((flag, flagIndex) => {
            if (type === OVERVIEW_TYPE) {
                flag.toOverview()
            } else if (type === LISTVIEW_TYPE) {
                flag.fadeOut(true, true)
            } else {
                let fromMenu = false
                if (goToProject && index === flagIndex) {
                    fromMenu = true
                }
                flag.toRoadview(fromMenu)
            }
        })
    }
}