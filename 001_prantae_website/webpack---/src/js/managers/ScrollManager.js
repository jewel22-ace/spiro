import {
    mode
} from '~data/debug'
import {
    SCROLL,
    PORTIONS_LABS,
    PORTIONS_PROJECTS
} from '~constants/'
import createCustomEvent from '../utils/createCustomEvent'
import {
    lerp
} from '~utils/math'
import {
    LISTVIEW_TYPE,
    OVERVIEW_TYPE,
    RAF,
    ROAD_TYPE,
    SWITCH_VIEW,
    TRANSITION_MENU_MAX_DURATION,
    WINDOW_RESIZE,
} from '../constants'
import {
    TimelineLite
} from 'gsap'
import {
    clamp
} from '../utils/math'
import TemplateManager from './TemplateManager'

const containerHeight = 15000
const DELAY_CAN_AUTOSCROLL = 200
const MAX_INDICATOR = 1352

class ScrollManager {
    index = 0
    progress = 0
    targetProgress = 0
    lastScrollY = 0
    loopedOnce = false
    coefMoveAlong = 0.11 / 15
    velocity = 0
    lastView = ROAD_TYPE

    constructor() {
        const scrollContainer = document.querySelector('.scroll-container')
        scrollContainer.style.height = `${containerHeight}px`

        this.scene = document.querySelector('[data-scene]')

        this.maxHeight = containerHeight - window.innerHeight
        this.events()

        if (mode) {
            const obj = {
                scrollProgress: 0.0,
            }

            // GUI.add(obj, 'scrollProgress', 0.0, 1.0).onChange(() => {
            //   this.progress = obj.scrollProgress
            // })
        }
    }

    events() {
        window.addEventListener('scroll', this.handleScroll)
        window.addEventListener(RAF, this.handleRAF)
        window.addEventListener(SWITCH_VIEW, this.switchView)
        window.addEventListener(WINDOW_RESIZE, this.handleResize)
    }

    addGradient(gradientT) {
        this.indicator = document.querySelector('[data-progress-indicator]')
        this.gradientT = gradientT
    }

    addObstacles(obstacles) {
        this.obstacles = obstacles
    }

    addSectionTitles(sectionTitles) {
        this.sectionTitles = sectionTitles
    }

    addProjectPP(projectPP) {
        this.projectPP = projectPP
    }

    addRoad(road) {
        this.road = road
    }

    handleScroll = () => {
        const scrollY = window.scrollY
        this.progress = clamp(scrollY / this.maxHeight, 0, 1)
        window.dispatchEvent(createCustomEvent(SCROLL, {
            scrollY
        }))

        if (this.indicator) {
            this.indicator.style.strokeDashoffset = `${(MAX_INDICATOR + MAX_INDICATOR * this.progress).toFixed(2)}`
        }

        TemplateManager.hideScrollText()

        if (this.gradientT) {
            if (this.progress > PORTIONS_LABS) {
                this.changeColors(2)
            } else if (this.progress > PORTIONS_PROJECTS && this.progress < PORTIONS_LABS) {
                this.changeColors(1)
            } else if (this.progress < PORTIONS_PROJECTS) {
                this.changeColors(0)
            }
        }

        this.lastScrollY = scrollY
    }

    handleRAF = e => {
        const {
            deltaTime
        } = e.detail
        // lerp progress
        if (
            this.targetProgress === this.progress ||
            !deltaTime ||
            !this.introFinished ||
            TemplateManager.menu.active ||
            !TemplateManager.menu.canSwitch
        )
            return

        if (this.autoScrolled) {
            this.targetProgress = this.progress
        } else {
            this.targetProgress = lerp(this.targetProgress, this.progress, this.coefMoveAlong * deltaTime)
        }

        if (!this.autoScrolled) {
            // clearTimeout(this.autoscrollTimeout)
            if (this.progress === 0 && this.velocity < 0) {
                if (this.loopedOnce && this.velocity > -0.0005) {
                    window.scrollTo(0, this.maxHeight)
                    this.targetProgress = this.progress
                    this.autoScrolled = 'bottom'
                    // console.log('scroll to b')
                    this.autoscrollTimeout = setTimeout(() => {
                        this.autoScrolled = false
                    }, DELAY_CAN_AUTOSCROLL)
                }
            } else if (this.progress === 1 && this.velocity > 0) {
                if (this.velocity < 0.0005) {
                    window.scrollTo(0, 0)
                    // console.log('scroll to t')
                    this.targetProgress = this.progress
                    this.loopedOnce = true
                    this.autoScrolled = 'top'
                    this.autoscrollTimeout = setTimeout(() => {
                        this.autoScrolled = false
                    }, DELAY_CAN_AUTOSCROLL)
                }
            }
        }

        this.velocity = this.progress - this.targetProgress
    }

    handleResize = () => {
        this.maxHeight = containerHeight - window.innerHeight
    }

    changeColors(nextIndex, fromMenu = false) {
        if (this.index === nextIndex) return // prevent calling twice
        const lastIndex = this.index

        this.gradientT.transitionToColor(lastIndex, nextIndex)
        this.obstacles.transitionToColor(lastIndex, nextIndex)
        this.projectPP.transitionToColor(lastIndex, nextIndex)
        this.road.transitionToColor(lastIndex, nextIndex)
        this.index = nextIndex

        if (!fromMenu) {
            this.sectionTitles[lastIndex].kill()
            this.sectionTitles[this.index].animate()
        }
    }

    switchView = e => {
        const {
            type,
            isAbout
        } = e.detail
        const tl = new TimelineLite()
        const duration = TRANSITION_MENU_MAX_DURATION

        if (type === OVERVIEW_TYPE || type === LISTVIEW_TYPE) {
            if (this.lastView === ROAD_TYPE) {
                this.lastScroll = this.progress
            }

            tl.to(this, {
                progress: 1,
                duration,
                ease: 'expo.out',
            })
        } else if (!isAbout) {
            tl.to(this, {
                progress: this.lastScroll,
                duration,
                ease: 'expo.out',
            })
        }

        this.lastView = type
    }
}

export default new ScrollManager()