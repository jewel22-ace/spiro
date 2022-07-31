import {
    MOBILE_BREAKPOINT,
    WINDOW_RESIZE
} from '../constants'
import ResizeManager from './ResizeManager'

class RotateDeviceManager {
    constructor() {
        this.el = document.querySelector('[data-rotate-device]')
        window.addEventListener(WINDOW_RESIZE, this.handleResize)
        this.handleResize()
    }

    handleResize = () => {
        if (ResizeManager.breakpoint === MOBILE_BREAKPOINT && window.innerHeight > window.innerWidth) {
            this.el.classList.add('is-visible')
        } else {
            this.el.classList.remove('is-visible')
        }
    }
}

export default new RotateDeviceManager()