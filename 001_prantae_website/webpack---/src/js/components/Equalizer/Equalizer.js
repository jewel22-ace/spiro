import {
    TweenLite
} from 'gsap/gsap-core'
import {
    TimelineLite
} from 'gsap/gsap-core'
import SoundManager from '../../managers/SoundManager'
import {
    randomFloat
} from '../../utils/math'

const initScale = 0.1

export default class Equalizer {
    canSwitch = true
    constructor() {
        this.el = document.querySelector('[data-equalizer]')
        this.lines = this.el.querySelectorAll('[data-equalizer-line]')

        this.tls = []

        this.lines.forEach(el => {
            const tl = new TimelineLite({
                paused: true,
                repeat: -1,
                yoyo: true,
            })

            // tl.set(el, { scaleY: finalPos })
            tl.fromTo(el, {
                scaleY: initScale
            }, {
                scaleY: randomFloat(0.1, 1),
                duration: randomFloat(0.5, 1)
            })
            tl.to(el, {
                scaleY: randomFloat(0.1, 1),
                duration: randomFloat(0.5, 1)
            })
            tl.to(el, {
                scaleY: randomFloat(0.1, 1),
                duration: randomFloat(0.5, 1)
            })
            tl.to(el, {
                scaleY: randomFloat(0.1, 1),
                duration: randomFloat(0.5, 1)
            })

            this.tls.push(tl)
        })

        this.el.addEventListener('click', this.handleClick)
        this.play()
    }

    play() {
        if (!this.canSwitch) return
        this.canSwitch = false
        this.isPlaying = true
        SoundManager.fadeIn()

        // this.tlMute.pause()
        // this.tlMute.clear()
        this.tls.forEach(tl => {
            tl.restart()
        })

        setTimeout(() => {
            this.canSwitch = true
        }, 500)
    }

    pause() {
        if (!this.canSwitch) return
        this.canSwitch = false
        this.isPlaying = false
        SoundManager.fadeOut()
        this.tls.forEach(tl => {
            tl.pause()
        })

        TweenLite.to(this.lines, {
            scaleY: initScale,
            duration: 0.8,
            ease: 'quad.out'
        })

        setTimeout(() => {
            this.canSwitch = true
        }, 500)
    }

    handleClick = () => {
        if (this.isPlaying) {
            this.pause()
        } else {
            this.play()
        }
    }
}