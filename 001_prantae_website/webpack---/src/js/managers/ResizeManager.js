import touchEnabled from '~utils/touchEnabled'
import createCustomEvent from '../utils/createCustomEvent'
import {
    DESKTOP_BREAKPOINT,
    MOBILE_BREAKPOINT,
    TABLET_BREAKPOINT,
    WINDOW_RESIZE
} from '../constants/index'

export const MOBILE = 768
export const TABLET = 1024

class ResizeManager {
    width = window.innerWidth
    height = window.innerHeight

    constructor() {
        // this.handleResize = throttle(this.handleResize, 100, { leading: false })
        this.isTouch = touchEnabled()
        this.dpr = window.devicePixelRatio

        window.addEventListener('resize', this.handleResize, {
            passive: true
        })
        if (this.isTouch) {
            window.addEventListener('deviceorientation', this.handleResize, true)
        }
        this.handleResize()
    }

    setPixelRatio(gpuTier) {
        const {
            gpu
        } = gpuTier
        if (gpuTier.fps <= 15 && gpuTier.fps >= 0) {
            this.tier = 1
        } else if (gpuTier.fps > 15 && gpuTier.fps < 50) {
            this.tier = 2
        } else {
            this.tier = 3
        }

        if (this.tier > 0 && (gpu.indexOf('iris') > 0 || gpu.indexOf('iris pro') > 0)) {
            let splitted = gpu.split(' ')
            let number = splitted[splitted.length - 1]
            number = parseInt(number, 10)
            if (!isNaN(number) && number < 650) {
                this.tier = 1
                this.tierForced = true
            }
        }

        if (gpu.indexOf('hd graphics') > 0) {
            this.tier = 1
            this.tierForced = true
        }

        // intel chipset
        if (gpu.indexOf('intel') > 0) {
            this.tier = Math.min(this.tier, 1)
            this.tierForced = true
        }

        // apple chipeset
        if (gpu.indexOf('Apple') > -1) {
            this.tier = 2
            this.tierForced = true
        }

        if (this.width > MOBILE && window.devicePixelRatio >= 2) {
            // For large screen retina, reduce DPR
            switch (this.tier) {
                case 0:
                case 1:
                    this.dpr = 1
                    break
                case 2:
                    this.dpr = 1.5
                    break
                case 3:
                    this.dpr = window.devicePixelRatio
                    break
            }
        }

        // this.dpr = 2 // for Test performance only
        // console.log(gpuTier, this.dpr)
    }

    handleResize = () => {
        this.width = window.innerWidth
        this.height = window.innerHeight

        if (this.width <= MOBILE) {
            this.breakpoint = MOBILE_BREAKPOINT
        } else if (this.width <= TABLET) {
            this.breakpoint = TABLET_BREAKPOINT
        } else {
            this.breakpoint = DESKTOP_BREAKPOINT
        }

        window.dispatchEvent(
            createCustomEvent(WINDOW_RESIZE, {
                width: this.width,
                height: this.height,
            }),
        )

        if (this.isTouch && this.width <= MOBILE) {
            setTimeout(() => {
                this.width = window.innerWidth
                this.height = window.innerHeight
                window.dispatchEvent(
                    createCustomEvent(WINDOW_RESIZE, {
                        width: this.width,
                        height: this.height,
                    }),
                )
            }, 300)
        }
    }
}

export default new ResizeManager()