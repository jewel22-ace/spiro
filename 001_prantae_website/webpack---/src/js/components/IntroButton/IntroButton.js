import {
    MOUSE_MOVE,
    RAF,
    WINDOW_RESIZE
} from '~constants/'
import createCustomEvent from '~utils/createCustomEvent'
import {
    lerp
} from '~utils/math'
import {
    CLICK_INTRO_BUTTON
} from '../../constants'
import {
    TimelineLite
} from 'gsap/gsap-core'
import ResizeManager from '../../managers/ResizeManager'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'
import {
    TweenLite
} from 'gsap/gsap-core'

const CURSOR_FORCE = 0.25 // 0.4
let LERP_FORCE = 0.08
// const LERP_FORCE_TEXT = 0.06
const CURSOR_FORCE_TEXT = 0.21 // 0.35
export default class IntroButton {
    forceX = 0
    forceY = 0
    targetX = 0
    targetY = 0
    forceTextX = 0
    forceTextY = 0
    textScale = 1
    scale = 1

    constructor() {}

    reset(el) {
        this.el = el

        this.circles = this.el.querySelectorAll('.intro__button__circle')
        this.text = this.el.querySelector('.intro__button__text')
        this.intro = document.body.querySelector('[data-intro]')

        this.destroy()
        this.init()
    }

    init() {
        this.setUnits()
        this.events(true)
    }

    setUnits = () => {
        const elRect = this.el.getBoundingClientRect()

        this.elX = elRect.left + this.el.offsetWidth / 2
        this.elY = elRect.top + this.el.offsetHeight / 2
        this.distanceMax = this.el.offsetWidth + 100
    }

    events(method) {
        const listen = method ? 'addEventListener' : 'removeEventListener'

        window[listen](WINDOW_RESIZE, this.setUnits, {
            passive: true
        })
        window[listen](RAF, this.handleRAF)
        this.circles[1][listen]('click', this.handleClick)
        if (!ResizeManager.isTouch) {
            // const delay = method ? 10000 : 0
            // setTimeout(() => {
            //   window[listen](MOUSE_MOVE, this.handleMouseMove)
            // }, delay) // to fix
            this.circles[1][listen]('mouseenter', this.circleMouseenter)
            this.circles[1][listen]('mouseleave', this.circleMouseleave)
        }
    }

    circleMouseenter = () => {
        if (this.circleEntered) return
        this.text.classList.add('is-hidden')
        this.circleEntered = true
        this.tlCircleLeave ? .kill()
        this.tlCircleEnter = new TimelineLite()
        this.tlCircleEnter.to(this, {
            scale: 1.1,
            duration: 1.5,
            ease: 'expo.out',
            onUpdate: () => {
                this.circles[1].setAttribute('r', `${86 * this.scale}`)
                this.circles[0].setAttribute('r', `${107 * this.scale}`)
            },
        })
    }

    circleMouseleave = () => {
        if (!this.circleEntered) return
        this.text.classList.remove('is-hidden')
        this.circleEntered = false
        this.tlCircleEnter ? .kill()
        this.tlCircleLeave = new TimelineLite()
        this.tlCircleLeave.to(this, {
            scale: 1,
            duration: 0.7,
            ease: 'expo.out',
            onUpdate: () => {
                this.circles[1].setAttribute('r', `${86 * this.scale}`)
                this.circles[0].setAttribute('r', `${107 * this.scale}`)
            },
        })
    }

    handleMouseMove = e => {
        if (this.isClicked) return
        const {
            e: event
        } = e.detail

        this.x = event.clientX
        this.y = event.clientY
    }

    getDistance() {
        const distance = Math.sqrt(Math.pow(this.x - this.elX, 2) + Math.pow(this.y - this.elY, 2))

        if (distance < this.distanceMax) {
            clearTimeout(this.timeoutReset)
            // this.targetX = this.x - this.elX
            // this.targetY = this.y - this.elY
            this.targetX = this.x - this.elX
            this.targetY = this.y - this.elY
            // this.forceX += targetX * 0.1
            this.isOut = false
            LERP_FORCE = 0.06
        } else if (!this.isOut) {
            // clearTimeout(this.timeoutReset)
            LERP_FORCE = 0.08
            this.targetX = 0
            this.targetY = 0
            this.isOut = true
        }
    }

    handleRAF = () => {
        if (!this.isClicked) {
            this.getDistance()
        }
        // this.forceX = lerp(this.forceX, this.targetX * CURSOR_FORCE, LERP_FORCE).toFixed(3)
        // this.forceY = lerp(this.forceY, this.targetY * CURSOR_FORCE, LERP_FORCE).toFixed(3)

        // this.forceTextX = lerp(this.forceTextX, this.targetX * CURSOR_FORCE_TEXT, LERP_FORCE).toFixed(3)
        // this.forceTextY = lerp(this.forceTextY, this.targetY * CURSOR_FORCE_TEXT, LERP_FORCE).toFixed(3)

        // this.circles[1].style.transform = `translateX(${this.forceX}px) translateY(${this.forceY}px) `
        // this.circles[0].style.transform = `translateX(${this.forceTextX}px) translateY(${this.forceTextY}px) `
        // this.text.style.transform = `translate(-50%, -50%) translateX(${this.forceX}px) translateY(${this.forceY}px) scale(${this.textScale})`
    }

    handleClick = () => {
        if (this.isClicked) return
        this.isClicked = true
        this.text.classList.add('is-hidden-end')

        this.circles[1].removeEventListener('mouseenter', this.circleMouseenter)
        this.circles[1].removeEventListener('mouseleave', this.circleMouseleave)

        SoundManager.initSounds()
        SoundManager.trigger(SOUNDS_CONST.CLICK)

        this.tl = new TimelineLite({
            onComplete: () => {
                window.dispatchEvent(createCustomEvent(CLICK_INTRO_BUTTON))
                this.destroy()
                this.circles[0].classList.add('is-hidden')
                this.circles[1].classList.add('is-hidden')
            },
        })
        this.tl.to(
            this, {
                scale: 1.2,
                duration: 1,
                ease: 'expo.out',
                onUpdate: () => {
                    this.circles[1].setAttribute('r', `${86 * this.scale}`)
                    this.circles[0].setAttribute('r', `${107 * this.scale}`)
                },
            },
            0.5,
        )
        this.tl.to(
            this, {
                targetX: 0,
                targetY: 0,
                duration: 1,
                ease: 'expo.out',
            },
            0,
        )
        this.tl.add(() => {
            this.intro.classList.add('transition-out')
        }, 0.5)
    }

    destroy() {
        this.events(false)
    }
}