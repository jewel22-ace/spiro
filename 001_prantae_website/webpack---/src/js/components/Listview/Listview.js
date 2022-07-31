import createCustomEvent from '../../utils/createCustomEvent'
import {
    LISTVIEW_TYPE,
    MOUSE_ENTER_LIST,
    MOUSE_LEAVE_LIST
} from '../../constants'
import ScrollManager from '../../managers/ScrollManager'
import PROJECTS from '~data/projects.json'
import TemplateManager from '../../managers/TemplateManager'
import {
    TimelineLite
} from 'gsap/gsap-core'
import SplitText from '~components/SplitText/SplitText'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'

export default class Listview {
    autoStagger = true
    previousY = 0
    previousRatio = 0
    constructor(el) {
        this.el = el
    }

    init() {
        this.container = this.el.querySelector('[data-listview]')
        this.titles = this.el.querySelectorAll('[data-listview-title]')
        this.items = this.el.querySelectorAll('[data-listview-item]')
        this.splittedTexts = this.el.querySelectorAll('[data-split-text]')
        this.changeColorThreshold = this.el.querySelector('[data-change-color]')

        this.initObserver()

        this.splitTextsTitles = []
        this.splittedTexts.forEach(el => {
            const splitText = new SplitText(el, true)
            this.splitTextsTitles.push(splitText)
        })

        this.el.classList.add('is-visible')

        setTimeout(() => {
            const autoStaggerEls = this.el.querySelectorAll('.auto-stagger')
            const tl = new TimelineLite({
                paused: true,
                delay: 0.2
            })
            let stagger = 0
            const intv = 0.15

            autoStaggerEls.forEach(el => {
                tl.add(() => {
                    el.classList.add('is-visible')
                }, stagger)

                stagger += intv
            })

            tl.play()
        }, 300)

        const delayCheckCanStagger = 1500
        setTimeout(() => (this.autoStagger = false), delayCheckCanStagger)

        this.events(true)
    }

    initObserver() {
        const options = {
            root: this.container,
            rootMargin: '0px',
            threshold: 0.0,
        }

        this.observer = new IntersectionObserver(this.handleObserver, options)
        this.items.forEach(el => {
            this.observer.observe(el)
        })

        this.splittedTexts.forEach(el => {
            this.observer.observe(el)
        })

        this.observer.observe(this.changeColorThreshold)
    }

    handleObserver = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (this.autoStagger) {
                    entry.target.classList.add('auto-stagger')
                } else {
                    entry.target.classList.add('is-visible')
                }
            }

            if (entry.target.dataset.changeColor === 'true') {
                const currentY = entry.boundingClientRect.y
                const currentRatio = entry.intersectionRatio
                // Scrolling down/up
                if (currentY < this.previousY) {
                    if (currentRatio > this.previousRatio) {
                        // console.log('Scrolling down enter')
                        ScrollManager.changeColors(1, true)
                        window.dispatchEvent(createCustomEvent(MOUSE_ENTER_LIST, {
                            index: PROJECTS.length,
                            changeColor: true
                        }))
                    } else {
                        // console.log('Scrolling down leave')
                        // ScrollManager.changeColors(1, true)
                        // window.dispatchEvent(createCustomEvent(MOUSE_ENTER_LIST, { index: PROJECTS.length, changeColor: true }))
                    }
                    // state.textContent = 'Scrolling down leave'
                } else if (currentY > this.previousY) {
                    if (currentRatio < this.previousRatio) {
                        // console.log('Scrolling up leave')
                        // state.textContent = 'Scrolling up leave'
                        ScrollManager.changeColors(0, true)
                        window.dispatchEvent(createCustomEvent(MOUSE_ENTER_LIST, {
                            index: 0,
                            changeColor: true
                        }))
                    } else {
                        // console.log('Scrolling up enter')
                        // console.log('oui')
                    }
                }

                this.previousY = currentY
                this.previousRatio = currentRatio
            }
        })
    }

    events(method) {
        const listener = method ? 'addEventListener' : 'removeEventListener'
        this.titles ? .forEach((el, index) => {
            el[listener]('mouseenter', () => {
                this.handleMouseenter(index)
            })
            el[listener]('mouseleave', () => {
                this.handleMouseleave(index)
            })
            el[listener]('click', () => {
                this.handleClick(index)
            })
        })
    }

    handleMouseenter = index => {
        window.dispatchEvent(createCustomEvent(MOUSE_ENTER_LIST, {
            index
        }))

        if (index > PROJECTS.length - 1) {
            ScrollManager.changeColors(1, true)
        } else {
            ScrollManager.changeColors(0, true)
        }
    }

    handleMouseleave = index => {
        window.dispatchEvent(createCustomEvent(MOUSE_LEAVE_LIST, {
            index
        }))
    }

    handleClick = index => {
        let type = 'project'
        if (index > PROJECTS.length - 1) {
            type = 'lab'
        }
        TemplateManager.menu.toRoadview({
            goToProject: true,
            type,
            index,
            view: LISTVIEW_TYPE
        })
        setTimeout(() => {
            window.dispatchEvent(createCustomEvent(MOUSE_LEAVE_LIST, {
                index
            }))
        }, 500)
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    destroy() {
        this.autoStagger = true
        this.observer ? .disconnect()
        this.observer = null
        this.el.classList.remove('is-visible')
        this.events(false)
    }
}