import createCustomEvent from '../utils/createCustomEvent'
import {
    RAF
} from '../constants/index'
import gsap from 'gsap/all'

class RAFManager {
    constructor() {
        this.time = Date.now()

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause()
            } else {
                this.start()
            }
        })
    }

    handleRAF = now => {
        // now: time in ms
        const currentTime = Date.now()
        const deltaTime = currentTime - this.time
        this.time = currentTime

        window.dispatchEvent(createCustomEvent(RAF, {
            now,
            deltaTime
        }))
    }

    start = () => {
        this.hasBeenInit = true
        gsap.ticker.add(this.handleRAF)
    }

    pause = () => {
        gsap.ticker.remove(this.handleRAF)
    }
}

export default new RAFManager()