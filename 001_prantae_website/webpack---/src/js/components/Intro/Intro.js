import {
    CLICK_INTRO_BUTTON,
    OVERLAY_INTRO_OUT,
    START_SCENE
} from '../../constants'
import RAFManager from '../../managers/RAFManager'
import createCustomEvent from '../../utils/createCustomEvent'
import SplitText from '../SplitText/SplitText'

export default class Intro {
    splittedTexts = []
    constructor() {
        this.el = document.body.querySelector('[data-intro]')
        this.elSvg = document.body.querySelector('[data-intro-svg]')
        this.btnEl = document.body.querySelector('[data-intro-button]')
        this.paths = this.elSvg.querySelectorAll('.intro__logo__path')

        this.textEls = document.body.querySelectorAll('[data-split-text]')
        this.textEls.forEach(el => {
            this.splittedTexts.push(new SplitText(el))
            el.classList.remove('is-hidden')
        })

        // this.start()

        window.addEventListener(CLICK_INTRO_BUTTON, this.handleClickButton)

        this.animatePaths()
    }

    animatePaths() {
        // Loop animation
        setTimeout(() => {
            this.elSvg.classList.add('is-visible')
            this.paths.forEach((el, index) => {
                // let delay = 0
                // if (index === 2 || index === 3) {
                //   delay = 200
                // } else if (index === 4 || index === 5) {
                //   delay = 400
                // }
                // setTimeout(() => {
                this.loopCssAnimations(el)
                // }, delay)
            })
        })
    }

    resetAnimationPath = e => {
        const el = e.target
        if (this.isReady && !el.nextSibling.nextSibling) {
            this.paths.forEach(path => {
                path.classList.remove('is-animated')
            })
            // if last path finish animation
            this.start()
        }
    }

    loopCssAnimations(path) {
        // path.classList.add('is-animated')

        path.addEventListener('animationiteration', this.resetAnimationPath)
    }

    finishLoaded = () => {
        this.isReady = true
    }

    start() {
        // Start RAF for animation of intro button
        RAFManager.start()

        setTimeout(() => {
            this.elSvg.classList.remove('is-visible')
            this.btnEl.classList.add('is-visible')
        }, 1000)
        //
        this.splittedTexts.forEach((splitText, index) => {
            setTimeout(() => {
                splitText.show()
            }, index * 500)
        })
    }

    handleClickButton = () => {
        window.dispatchEvent(createCustomEvent(START_SCENE))
        // Laggy because of Webgl scene objects creations

        setTimeout(() => {
            this.destroy()
            window.dispatchEvent(createCustomEvent(OVERLAY_INTRO_OUT))
        }, 500)
    }

    destroy() {
        this.paths.forEach(path => {
            path.removeEventListener('animationiteration', this.resetAnimationPath)
        })
        this.el.remove()
    }
}