import {
    SWITCH_VIEW,
    BACK_ON_ROAD,
    GO_TO_PROJECT,
    GO_TO_PROJECT_FROM_MENU,
    OVERLAY_TRANSITION,
    DELAY_MENU_TO_PROJECT,
} from '~constants/'
import CameraController from '../components/CameraController'
import OverviewProjects from '../components/Menu/OverviewProjects'
import Sidebar from '../components/Menu/Sidebar'
import {
    LISTVIEW_TYPE,
    OVERVIEW_TYPE,
    ROAD_TYPE
} from '../constants'
import createCustomEvent from '../utils/createCustomEvent'
import RaycasterManager from './RaycasterManager'
import ScrollManager from './ScrollManager'
import SoundManager, {
    SOUNDS_CONST
} from './SoundManager'

export default class MenuManager {
    active = false
    canSwitch = false
    cameFromView = false
    viewType = ROAD_TYPE

    constructor(templateManager) {
        this.templateManager = templateManager
        if (this.active) {
            document.body.classList.add('no-scroll')
        }

        this.el = document.body.querySelector('[data-menu]')
        this.icon = this.el.querySelector('[data-menu-icon]')

        const elSidebar = document.body.querySelector('[data-sidebar]')
        this.sidebar = new Sidebar(elSidebar)
        const elOverviewProjects = document.body.querySelector('[data-overview-projects]')
        this.overviewProjects = new OverviewProjects(elOverviewProjects)

        this.icon.addEventListener('click', this.toOverview)
        window.addEventListener(BACK_ON_ROAD, this.show)
        window.addEventListener(GO_TO_PROJECT, this.hide)
    }

    show = () => {
        this.el.parentNode.classList.add('is-visible')
    }

    hide = () => {
        this.el.parentNode.classList.remove('is-visible')
    }

    toOverview = () => {
        if (!this.canSwitch || this.viewType === OVERVIEW_TYPE) return
        SoundManager.trigger(SOUNDS_CONST.CLICK)
        this.viewType = OVERVIEW_TYPE
        this.templateManager.hideScrollText()
        this.canSwitch = false
        // update sidebar
        this.sidebar.clearActive()
        this.showSidebar()

        const delayStartTransition = this.cameFromView ? DELAY_MENU_TO_PROJECT * 1000 : 0

        setTimeout(() => {
            document.body.classList.add('no-scroll')
            this.sidebar.el.classList.add('is-visible')
            this.el.classList.add('is-active')
            this.show()
            window.dispatchEvent(createCustomEvent(SWITCH_VIEW, {
                type: OVERVIEW_TYPE
            }))
            CameraController.toOverview(() => {
                // end of transition
                // this.canSwitch = true
            })
            RaycasterManager.updateObserver({
                view: OVERVIEW_TYPE
            })
        }, delayStartTransition)

        setTimeout(() => {
            this.canSwitch = true
        }, 1000)

        if (this.cameFromView === OVERVIEW_TYPE) {
            window.dispatchEvent(createCustomEvent(OVERLAY_TRANSITION))
        } else {
            this.cameFromView = false
        }
    }

    toListview() {
        if (!this.canSwitch || this.viewType === LISTVIEW_TYPE) return
        this.viewType = LISTVIEW_TYPE
        this.el.classList.remove('is-active')
        this.sidebar.listviewEl.classList.add('is-active')
        this.showSidebar()
        this.overviewProjects.removeText()

        this.canSwitch = false

        const delayStartTransition = this.cameFromView === ROAD_TYPE ? DELAY_MENU_TO_PROJECT * 1000 : 0
        ScrollManager.changeColors(0, true)

        setTimeout(() => {
            this.templateManager.transitionInListview()
            document.body.classList.add('no-scroll')
            this.sidebar.el.classList.add('is-visible')
            this.el.classList.remove('is-active')
            if (this.cameFromView === LISTVIEW_TYPE) {
                this.show()
            }
            window.dispatchEvent(createCustomEvent(SWITCH_VIEW, {
                type: LISTVIEW_TYPE
            }))
            CameraController.toListview(() => {
                // end of transition
                // this.canSwitch = true
            })
            RaycasterManager.updateObserver({
                view: LISTVIEW_TYPE
            })
        }, delayStartTransition)

        setTimeout(() => {
            this.canSwitch = true
        }, 1000)

        if (this.cameFromView === LISTVIEW_TYPE) {
            window.dispatchEvent(createCustomEvent(OVERLAY_TRANSITION))
        } else {
            this.cameFromView = false
        }
    }

    toRoadview({
        goToProject = false,
        type,
        index,
        view = OVERVIEW_TYPE
    }) {
        if (!this.canSwitch || this.viewType === ROAD_TYPE) return
        this.viewType = ROAD_TYPE
        this.hideSidebar()
        this.cameFromView = goToProject ? view : false
        this.overviewProjects.removeText()
        this.canSwitch = false

        const isAbout = type === 'about'
        const delayStartTransition = goToProject ? DELAY_MENU_TO_PROJECT * 1000 : 0
        // change BKG colors if needed
        switch (type) {
            default: ScrollManager.changeColors(0, true)
            break
            case 'lab':
                    ScrollManager.changeColors(1, true)
                break
            case 'about':
                    ScrollManager.changeColors(2, true)
                break
        }

        if (goToProject) {
            this.hide()
            if (view === LISTVIEW_TYPE) {
                this.templateManager.transitionOutListview()
            }
            window.dispatchEvent(createCustomEvent(OVERLAY_TRANSITION))

            setTimeout(() => {
                window.dispatchEvent(
                    createCustomEvent(GO_TO_PROJECT_FROM_MENU, {
                        index,
                        view,
                    }),
                )
            }, delayStartTransition)

            setTimeout(() => {
                this.canSwitch = true
            }, 4000)
        } else {
            CameraController.toRoadview(() => {
                this.canSwitch = true
            }, type)
        }

        setTimeout(() => {
            this.el.classList.remove('is-active')
            window.dispatchEvent(createCustomEvent(SWITCH_VIEW, {
                type: ROAD_TYPE,
                goToProject,
                index,
                isAbout
            }))
            this.sidebar.el.classList.remove('is-visible')
            if (!goToProject) {
                RaycasterManager.updateObserver({})
            }
        }, delayStartTransition)
    }

    showSidebar() {
        this.active = true
    }

    hideSidebar() {
        this.active = false
        this.sidebar.clearActive()
    }
}