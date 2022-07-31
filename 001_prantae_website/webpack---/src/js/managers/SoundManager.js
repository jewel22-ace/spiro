import {
    Howl
} from 'howler'

const DURATION_FADE = 500

export const SOUNDS_CONST = {
    AMBIENT: 'ambient',
    CLICK: 'click',
    MVT_CAMERA: 'mvt_camera',
    MVT_CAMERA_SLOW: 'mvt_camera_slow',
    PARTICLES: 'particles',
}

const SOUNDS = [{
        name: SOUNDS_CONST.AMBIENT,
        src: 'sounds/ambient.mp3',
        autoplay: true,
        loop: true,
        volume: 0.7,
    },
    {
        name: SOUNDS_CONST.CLICK,
        src: 'sounds/click.wav',
        volume: 0.2,
    },
    {
        name: SOUNDS_CONST.PARTICLES,
        src: 'sounds/particle-fade-in.wav',
        volume: 0.03,
    },
    {
        name: SOUNDS_CONST.MVT_CAMERA,
        src: 'sounds/mvt-camera-slow.mp3',
        volume: 0.3,
    },
    {
        name: SOUNDS_CONST.MVT_CAMERA_SLOW,
        src: 'sounds/particle-fade-in-2.wav',
        volume: 0.3,
    },
]

class SoundManager {
    sounds = {}
    constructor() {}

    initSounds() {
        SOUNDS.forEach(sound => {
            const {
                autoplay,
                loop,
                volume,
                src,
                name
            } = sound
            const howl = new Howl({
                src: [src],
                autoplay,
                loop,
                volume,
            })

            if (name === SOUNDS_CONST.AMBIENT) {
                howl.seek(11)
            }

            howl.initVolume = volume

            this.sounds[name] = howl
        })

        this.fadeIn()
    }

    trigger(key) {
        if (this.sounds[key]) {
            this.sounds[key].play()
        }
    }

    fadeIn() {
        Object.values(this.sounds).forEach(el => {
            el.fade(0, el.initVolume, DURATION_FADE)
        })
    }

    fadeOut() {
        Object.values(this.sounds).forEach(el => {
            el.fade(el.initVolume, 0, DURATION_FADE)
        })
    }
}

export default new SoundManager()