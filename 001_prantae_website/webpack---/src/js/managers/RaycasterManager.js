import {
    Raycaster,
    Vector2
} from 'three'
import {
    MOUSE_MOVE
} from '~constants/'
import createCustomEvent from '~utils/createCustomEvent'
import CameraController from '~components/CameraController'
import ResizeManager from './ResizeManager'
import Hammer from 'hammerjs'
import TemplateManager from './TemplateManager'
import {
    LISTVIEW_TYPE,
    OVERVIEW_TYPE,
    ROAD_TYPE
} from '../constants'

class RaycasterManager {
    isReady = false
    observedMeshes = []
    currentIntersect = null
    intersects = []

    constructor() {
        this.ray = new Raycaster()
        this.mouse = new Vector2()

        this.events()
    }

    events() {
        if (ResizeManager.isTouch) {
            const el = document.body.querySelector('[data-touch-zone]')
            const mc = new Hammer.Manager(el)

            mc.add(new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL
            }))

            mc.on('pan', this.handlePan)
        } else {
            window.addEventListener('mousemove', this.handleMouseMove)
        }
    }

    // EVENTS
    handleMouseMove = e => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1

        this.mouse.x = x
        this.mouse.y = y

        this.updateCurrentIntersect(this.mouse)

        window.dispatchEvent(createCustomEvent(MOUSE_MOVE, {
            x,
            y,
            e
        }))
    }

    handlePan = e => {
        const x = (e.center.x / window.innerWidth) * 2 - 1
        const y = -(e.center.y / window.innerHeight) * 2 + 1

        this.mouse.x = x
        this.mouse.y = y

        this.updateCurrentIntersect(this.mouse)

        window.dispatchEvent(createCustomEvent(MOUSE_MOVE, {
            x,
            y,
            e
        }))
    }

    add(flags) {
        this.flags = flags
    }

    addObstacles(electrons, boxes, columns) {
        this.electrons = electrons
        this.boxes = boxes
        this.columns = columns
    }

    updateObserver({
        view = ROAD_TYPE,
        socials = []
    }) {
        const hoverableObjects = []

        let flagsToCheck = this.flags ? .flagsRendered
        // flagsToCheck = []

        if (view === OVERVIEW_TYPE) {
            flagsToCheck = this.flags ? .flags
        } else if (view === LISTVIEW_TYPE) {
            flagsToCheck = []
        }

        let projectZoomed = false

        for (const project of flagsToCheck) {
            const {
                title,
                particleFlag,
                subtitle,
                zoomed,
                nextMesh,
                prevMesh
            } = project
            if (TemplateManager.menu.active) {
                hoverableObjects.push(particleFlag.circle)
            } else {
                hoverableObjects.push(particleFlag.plane)
            }

            if (zoomed) {
                hoverableObjects.push(nextMesh.arrowMesh)
                hoverableObjects.push(prevMesh.arrowMesh)
                projectZoomed = true
            } else {
                hoverableObjects.push(title.mesh)
                if (subtitle ? .mesh) {
                    hoverableObjects.push(subtitle.mesh)
                }
            }
        }

        if (!projectZoomed) {
            for (const electron of this.electrons) {
                if (electron.isFadedIn || electron.isTriggered) {
                    const {
                        centerMesh
                    } = electron
                    hoverableObjects.push(centerMesh)
                }
            }

            for (const box of this.boxes) {
                if (box.isFadedIn || box.isTriggered) {
                    const {
                        object3D
                    } = box
                    const arr = object3D.children
                    hoverableObjects.push(...arr)
                }
            }

            for (const column of this.columns) {
                if (column.isFadedIn || column.isTriggered) {
                    const {
                        object3D
                    } = column
                    const arr = object3D.children
                    hoverableObjects.push(...arr)
                }
            }
        }

        for (let i = 0; i < socials.length; i++) {
            const mesh = socials[i]
            hoverableObjects.push(mesh)
        }

        this.observedMeshes = hoverableObjects
    }

    updateCurrentIntersect(mouse) {
        if (!this.isReady) return
        // recheck currentIntersect because of click conflicts
        this.ray.setFromCamera(mouse, CameraController.camera)
        this.intersects = this.ray.intersectObjects(this.observedMeshes)

        if (this.intersects.length) {
            if (!this.currentIntersect || ResizeManager.isTouch) {
                document.body.style.cursor = 'pointer'
                this.currentIntersect = this.intersects[0]
            }
        } else if (this.currentIntersect) {
            document.body.style.cursor = 'default'
            this.currentIntersect = null
        }
    }
}

export default new RaycasterManager()