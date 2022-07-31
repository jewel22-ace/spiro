import {
    BACK_ON_ROAD,
    MOUSE_MOVE,
    RAF,
    WINDOW_RESIZE
} from '~constants/'
import createCustomEvent from '~utils/createCustomEvent'
import ResizeManager from '~managers/ResizeManager'
import {
    lerp
} from '~utils/math'
import {
    TweenLite
} from 'gsap'
import throttle from 'lodash/throttle'
import {
    GO_TO_MENU_FROM_PROJECT
} from '../../constants'
import TemplateManager from '../../managers/TemplateManager'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'

const CURSOR_FORCE = 1 // 0.4
const DISTANCE_MAX = 0.075 // vw
const DISTANCE_MAX_NEXT = 0.05
const LERP_FORCE = 0.08
// const LERP_FORCE_TEXT = 0.06
const CURSOR_FORCE_TEXT = 0.85 // 0.35
const DELAY_OUT = 250
export default class ProjectBackCta {
    forceX = 0
    forceY = 0
    targetX = 0
    targetY = 0
    forceTextX = 0
    forceTextY = 0
    forceNextX = 0
    forceNextY = 0
    targetNextX = 0
    targetNextY = 0
    forceTextNextX = 0
    forceTextNextY = 0

    constructor() {}

    reset(el) {
        this.el = el
        this.projectContainer = document.body.querySelector('.project__container')

        this.circle = this.el.querySelector('.project__back-circle')
        this.text = this.el.querySelector('.project__back-cta')
        this.isRight = document.body.querySelector('.project.is-right')

        this.next = el.parentNode.querySelector('[data-project-next]')
        this.nextCircle = this.next.querySelector('.project__next-circle')
        this.nextText = this.next.querySelector('.project__next-cta')
        this.destroy()
        this.init()

        const duration = 1.5
        const obj = {
            x: 0
        }
        this.updateUnitsDuringAnim = throttle(this.updateUnitsDuringAnim, 200)

        TweenLite.to(obj, {
            duration,
            x: 1,
            onUpdate: () => {
                this.updateUnitsDuringAnim()
            },
        })
    }

    updateUnitsDuringAnim = () => {
        this.setUnits()
    }

    init() {
        this.setUnits()
        this.events(true)
    }

    setUnits = () => {
        const nextRect = this.next.getBoundingClientRect()
        const elRect = this.el.getBoundingClientRect()

        if (this.isRight) {
            this.elX = elRect.right - this.el.offsetWidth / 2
            this.nextX = nextRect.right - this.next.offsetWidth / 2
        } else {
            this.elX = elRect.left + this.el.offsetWidth / 2
            this.nextX = nextRect.left + this.next.offsetWidth / 2
        }

        this.elY = elRect.top + this.el.offsetHeight / 2
        this.nextY = nextRect.top + this.next.offsetHeight / 2
    }

    events(method) {
        const listen = method ? 'addEventListener' : 'removeEventListener'
        if (this.el) this.el[listen]('click', this.handleClick)
        window[listen](MOUSE_MOVE, this.handleMouseMove)
        window[listen](WINDOW_RESIZE, this.setUnits, {
            passive: true
        })
        window[listen](RAF, this.handleRAF)
        if (this.projectContainer) this.projectContainer[listen]('scroll', this.setUnits)
    }

    handleMouseMove = e => {
        const {
            e: event
        } = e.detail

        this.x = event.clientX
        this.y = event.clientY
    }

    getDistance() {
        const distance = Math.sqrt(Math.pow(this.x - this.elX, 2) + Math.pow(this.y - this.elY, 2))

        if (distance < ResizeManager.width * DISTANCE_MAX) {
            clearTimeout(this.timeoutReset)
            // this.targetX = this.x - this.elX
            // this.targetY = this.y - this.elY
            this.targetX = this.x - this.elX
            this.targetY = this.y - this.elY
            // this.forceX += targetX * 0.1
            this.isOut = false
        } else if (!this.isOut) {
            this.timeoutReset = setTimeout(() => {
                this.targetX = 0
                this.targetY = 0
                this.isOut = false
            }, DELAY_OUT)
            this.isOut = true
        }
    }

    getDistanceNext() {
        const distance = Math.sqrt(Math.pow(this.x - this.nextX, 2) + Math.pow(this.y - this.nextY, 2))

        if (distance < ResizeManager.width * DISTANCE_MAX_NEXT) {
            clearTimeout(this.timeoutNextReset)
            this.targetNextX = this.x - this.nextX
            this.targetNextY = this.y - this.nextY
            // this.forceX += targetX * 0.1
            this.isNextOut = false
        } else if (!this.isNextOut) {
            this.timeoutNextReset = setTimeout(() => {
                this.targetNextX = 0
                this.targetNextY = 0
                this.isNextOut = false
            }, DELAY_OUT)
            this.isNextOut = true
        }
    }

    handleRAF = () => {
        this.getDistance()
        this.forceX = lerp(this.forceX, this.targetX * CURSOR_FORCE, LERP_FORCE)
        this.forceY = lerp(this.forceY, this.targetY * CURSOR_FORCE, LERP_FORCE)

        this.forceTextX = lerp(this.forceTextX, this.targetX * CURSOR_FORCE_TEXT, LERP_FORCE)
        this.forceTextY = lerp(this.forceTextY, this.targetY * CURSOR_FORCE_TEXT, LERP_FORCE)

        this.circle.style.transform = `translateX(${this.forceX}px) translateY(${this.forceY}px)`
        this.text.style.transform = `translateX(${this.forceTextX}px) translateY(${this.forceTextY}px)`

        // next
        this.getDistanceNext()
        this.forceNextX = lerp(this.forceNextX, this.targetNextX * CURSOR_FORCE, LERP_FORCE)
        this.forceNextY = lerp(this.forceNextY, this.targetNextY * CURSOR_FORCE, LERP_FORCE)

        this.forceTextNextX = lerp(this.forceTextNextX, this.targetNextX * CURSOR_FORCE_TEXT, LERP_FORCE)
        this.forceTextNextY = lerp(this.forceTextNextY, this.targetNextY * CURSOR_FORCE_TEXT, LERP_FORCE)

        this.nextCircle.style.transform = `translateX(${this.forceNextX}px) translateY(${this.forceNextY}px)`
        this.nextText.style.transform = `translateX(${this.forceTextNextX}px) translateY(${this.forceTextNextY}px)`
    }

    handleClick = () => {
        if (TemplateManager.menu.cameFromView) {
            const view = TemplateManager.menu.cameFromView
            window.dispatchEvent(createCustomEvent(GO_TO_MENU_FROM_PROJECT, {
                view
            }))
        } else {
            window.dispatchEvent(createCustomEvent(BACK_ON_ROAD))
        }
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    destroy() {
        this.events(false)
    }
}