import {
    Object3D,
    Vector3
} from 'three'
import ParticlesFlag from './ParticlesFlag/ParticlesFlag'
import Stick from './Stick/Stick'
import Title from './Title/Title'
import {
    PROJECT_STICK_HEIGHT
} from '~constants/'
import {
    TimelineLite
} from 'gsap/all'
import Arrow from './Arrows/Arrow'
import {
    sortPoints,
    degToRad
} from '~utils/three'
import CameraController from '../CameraController'
import {
    MOUSE_ENTER_LIST,
    MOUSE_LEAVE_LIST,
    TRANSITION_MENU_MAX_DURATION
} from '../../constants'
import {
    isVideoPlaying
} from '../../utils/dom'
import ResizeManager from '~managers/ResizeManager'
import ParticlesFlagList from './ParticlesFlag/ParticlesFlagList'
import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'
import LoaderManager from '../../managers/LoaderManager'
import {
    MOBILE
} from '../../managers/ResizeManager'

const SCALE_MENU_VIEW = 5
const EL_TOUCH = document.body.querySelector('[data-touch-zone]')

export default class Flag {
    canRender = false
    tlFadeIn = null
    zoomed = false

    constructor({
        position,
        index,
        guiController,
        lookAt,
        directionCenter,
        data,
        scrollValue,
        touch,
        type,
        flagIndex,
    } = {}) {
        this.index = index
        this.initLookAt = lookAt
        this.lookAt = new Vector3(this.initLookAt.x, this.initLookAt.y + PROJECT_STICK_HEIGHT, this.initLookAt.z)
        this.progress = 0
        this.guiController = guiController
        this.amplitude = this.guiController.amplitude
        this.amplitudeTarget = this.amplitude
        this.position = position
        this.directionCenter = directionCenter
        this.data = data
        this.scrollValue = scrollValue
        this.touch = touch
        this.type = type
        this.flagIndex = flagIndex

        this.canUpdateAmplitude = true

        this.object3d = new Object3D()

        this.createFlag()
        this.particleFlag.plane.flagIndex = flagIndex
        this.particleFlag.circle.flagIndex = flagIndex

        if (LoaderManager.subjects[`${this.id}_placholder`]) {
            this.placeholderTex = LoaderManager.subjects[`${this.id}_placholder`].texture
        }

        if (type !== 'list') {
            this.createStick()
            this.title = new Title(this)
            this.title.mesh.flagIndex = flagIndex

            if (this.data.subtitle) {
                this.subtitle = new Title(this, 'subtitle')
                if (this.subtitle.mesh) {
                    this.subtitle.mesh.flagIndex = flagIndex
                }
            }

            this.nextMesh = new Arrow(this, 'next', this.particleFlag)
            this.prevMesh = new Arrow(this, 'prev', this.particleFlag)

            this.fadeOut(true)
        } else {
            this.initListFlag()
            window.addEventListener(MOUSE_ENTER_LIST, this.listFlagExpand)
            window.addEventListener(MOUSE_LEAVE_LIST, this.listFlagShrink)
        }

        if (ResizeManager.isTouch && ResizeManager.width <= MOBILE) {
            document.body.addEventListener('click', () => {
                const tex = this.particleFlag.textures[this.particleFlag.sliderIndex]
                if (tex) {
                    this.checkVideoCanPlay(tex)
                }
            })
        }
    }

    createStick() {
        this.stickHighestPoint = new Vector3()
        this.stickHighestPoint.copy(this.position)
        this.stickHighestPoint.y += PROJECT_STICK_HEIGHT
        this.stick = new Stick(this.position, this.initLookAt)
        this.object3d.add(this.stick.object3d)
    }

    createFlag() {
        if (this.type !== 'list') {
            this.particleFlag = new ParticlesFlag(null, this.index, this.directionCenter, this.touch, this.type)
            this.particleFlag.setTextures()
            this.particleFlag.placeOnRoad(this)
        } else {
            this.particleFlag = new ParticlesFlagList(null, this.index, this.directionCenter, this.touch, this.type)
            this.object3d.add(this.particleFlag.object3d)
        }
    }

    canPlayVideo(video) {
        return video.HAVE_FUTURE_DATA
    }

    fadeIn(menuView = false) {
        this.tlFadeOut ? .kill()
        this.canRender = true
        this.object3d.visible = true

        this.tlFadeIn = new TimelineLite()

        if (this.type === 'list') {
            this.particleFlag.material.uniforms.uAlpha.value = 0
            this.particleFlag.material.uniforms.uStormProgress.value = 0
            this.tlFadeIn.fromTo(
                this.particleFlag.material.uniforms.uStormProgress, {
                    value: 0
                }, {
                    value: 1,
                    duration: 3.5,
                    delay: 2.5
                },
                0,
            )
            this.tlFadeIn.fromTo(
                this.particleFlag.material.uniforms.uAlpha, {
                    value: 0
                }, {
                    value: 1,
                    duration: 2,
                    delay: 2.5
                },
                0,
            )
            return
        }

        if (!menuView) {
            this.tlFadeIn.to(this.particleFlag.material.uniforms.uStormProgress, {
                value: 1,
                duration: 1.8
            }, 0)
            this.tlFadeIn.to(this.particleFlag.material.uniforms.uAlpha, {
                value: 1,
                duration: 1.8
            }, 0.2)

            this.tlFadeIn.add(() => {
                SoundManager.trigger(SOUNDS_CONST.PARTICLES)
                this.stick.fadeIn()
            }, 0.3)
            this.tlFadeIn.add(() => {
                this.title.fadeIn()
            }, 0.5)

            if (this.subtitle) {
                this.tlFadeIn.add(() => {
                    this.subtitle.fadeIn()
                }, 0.55)
            }

            this.isVisible = true
            this.loadTextureFirst(this.particleFlag.textures[this.particleFlag.sliderIndex])
        } else {
            // clear textures
            this.tlFadeIn.to(this.particleFlag.material.uniforms.uStormProgress, {
                value: 1,
                duration: 0.0
            }, 0)
            this.tlFadeIn.to(this.particleFlag.material.uniforms.uAlpha, {
                value: 1,
                duration: 2.5
            }, 0)

            const {
                video
            } = this.particleFlag.textures[this.particleFlag.sliderIndex]
            if (video) {
                if (isVideoPlaying(video)) {
                    video.currentTime = 0
                    video.pause()
                }
            }
        }
    }

    animTextureAppear() {
        // this.tlTextureAppear?.kill()
        // this.tlFadeOut?.kill()
        this.tlTextureAppear = new TimelineLite()
        const duration = 0.5
        this.tlTextureAppear.to(
            this.particleFlag.material.uniforms.uTextureLoadProgress, {
                value: 1,
                duration,
            },
            0,
        )
    }

    fadeOut(fast = false, menuView = false) {
        // kill previous fadeIn animation
        this.tlFadeIn ? .kill()
        const duration = fast ? 0 : 1
        this.tlFadeOut = new TimelineLite({
            onComplete: () => {
                this.canRender = false
                this.particleFlag.material.uniforms.uTexture.value = null
                this.particleFlag.material.uniforms.uTextureNext.value = null
                this.object3d.visible = false
            },
        })

        if (this.type === 'list') {
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uStormProgress, {
                value: 0,
                duration: 3.5
            }, 0)
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uAlpha, {
                value: 0,
                duration: 2
            }, 0)
        } else if (!menuView) {
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uStormProgress, {
                value: 0,
                duration
            }, 0)
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uAlpha, {
                value: 0,
                duration
            }, 0)
        } else {
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uStormProgress, {
                value: 0,
                duration: 3
            }, 0)
            this.tlFadeOut.to(this.particleFlag.material.uniforms.uAlpha, {
                value: 0,
                duration: 1
            }, 0)
        }

        this.stick ? .fadeOut()
        this.title ? .fadeOut()
        this.subtitle ? .fadeOut()

        this.isVisible = false

        this.particleFlag.textures.forEach(tex => {
            if (tex.video) {
                if (isVideoPlaying(tex.video)) {
                    tex.video.currentTime = 0
                    tex.video.pause()
                }
            }
        })
    }

    initListFlag() {
        this.canRender = true
        this.isVisible = true
        this.canHoverMenu = true
    }

    loadTextureFirst(tex) {
        const {
            video
        } = tex

        if (video) {
            // check video load if needed
            // console.log('loadTexture video', this.index)
            this.playVideo(tex)
        }
        // start loading all textures of project
        // console.log('loadTexture image', this.index)
        this.particleFlag.loadTextureImage().then(() => {
            // console.log('loadTexture image then', this.index)
            this.animTextureAppear()
        })
    }

    playVideo(tex) {
        this.checkVideoCanPlay(tex)
    }

    checkVideoCanPlay(tex) {
        const showVideoTexture = () => {
            this.particleFlag.material.uniforms.uTexture.value = tex.source
            this.animTextureAppear()
            tex.loaded = true
            tex.video.pause()
            tex.video.currentTime = 0
            tex.video.play()
            // console.log('play', this.index)
            // tex.video.removeEventListener('canplay', showVideoTexture)
        }

        if (tex.video.readyState >= 3 || tex.loaded || (ResizeManager.isTouch && ResizeManager.width <= MOBILE)) {
            showVideoTexture()
        } else {
            clearInterval(this.intervalCheckVid)
            this.intervalCheckVid = setInterval(() => {
                if (tex.video.readyState >= 3) {
                    clearInterval(this.intervalCheckVid)
                    showVideoTexture()
                }
            }, 300)

            // tex.video.addEventListener('canplay', showVideoTexture)
        }
    }

    listFlagExpand = e => {
        const {
            index,
            changeColor
        } = e.detail
        if (changeColor) {
            this.particleFlag.updateColors(index)
        } else {
            this.particleFlag.updateTextures(index)
            this.circleToFlag()
        }
    }

    listFlagShrink = () => {
        this.flagToCircle()
    }

    toggleZoom(goToZoom) {
        if (goToZoom) {
            this.zoomed = true
            this.particleFlag.toggleZoom(goToZoom)
            this.prevMesh.fadeArrowIn()
            this.nextMesh.fadeArrowIn()
            this.unBend()
            setTimeout(() => {
                // sort geometry
                sortPoints(this.particleFlag, CameraController.camera)
            }, 1000)
            if (ResizeManager.isTouch) {
                EL_TOUCH.classList.add('is-visible')
            }
        } else {
            this.zoomed = false
            this.particleFlag.toggleZoom(goToZoom)
            this.prevMesh.fadeArrowOut()
            this.nextMesh.fadeArrowOut()
            this.bend()

            if (ResizeManager.isTouch) {
                EL_TOUCH.classList.remove('is-visible')
            }
        }
    }

    unBend() {
        const duration = 2
        if (this.timelineBendIn) this.timelineBendIn.kill()
        this.timelineBendOut = new TimelineLite()
        this.timelineBendOut.to(this.particleFlag.material.uniforms.uBend, {
            value: 0,
            duration,
            ease: 'expo.out'
        }, 0)
        this.timelineBendOut.to(this.particleFlag.material.uniforms.uAmplitude, {
            value: 1,
            duration,
            ease: 'expo.out'
        }, 0)
        // TweenLite.to(this.particleFlag.material.uniforms.uAplha, {value: 1, duration, ease: 'expo.out'})
    }

    bend() {
        const duration = 1.2
        if (this.timelineBendOut) this.timelineBendOut.kill()
        this.timelineBendIn = new TimelineLite()
        this.timelineBendIn.to(this.particleFlag.material.uniforms.uBend, {
            value: 0.7,
            duration,
            ease: 'expo.out'
        }, 0)
        this.timelineBendIn.to(this.particleFlag.material.uniforms.uAmplitude, {
            value: 3,
            duration,
            ease: 'expo.out'
        }, 0)
        // TweenLite.to(this.particleFlag.material.uniforms.uAplha, {value: 0.6, duration, ease: 'expo.out'})
    }

    render(now, deltaTime) {
        if (!this.canRender) return
        this.particleFlag.render(deltaTime)
        if (this.stick) {
            this.stick.render(deltaTime)
        }

        if (this.zoomed) {
            // sortPoints(this.particleFlag, CameraController.camera)
        }
        // sortPoints(this.particleFlag.geometry)
    }

    toOverview() {
        this.tlDefaultView ? .kill()
        const object = this.particleFlag.object3d
        object.updateMatrix()

        const duration = TRANSITION_MENU_MAX_DURATION - 1
        const s = SCALE_MENU_VIEW
        this.textureAppeared = false

        const tl = new TimelineLite({
            onComplete: () => {
                this.canRender = true

                sortPoints(this.particleFlag, CameraController.camera)
            },
        })

        const obj = {
            value: 0,
        }

        tl.to(
            obj, {
                value: 1,
                duration,
                ease: 'expo.out',
                onUpdate: () => {
                    object.scale.set(s * obj.value, s * obj.value, s * obj.value)
                    this.particleFlag.material.uniforms.uMenuViewProgress.value = obj.value
                    this.particleFlag.material.uniforms.uMenuViewHoverProgress.value = 1 - obj.value
                },
            },
            0,
        )

        tl.to(
            object.rotation, {
                x: degToRad(-90),
                y: 0,
                z: 0,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        tl.to(
            [this.particleFlag.material.uniforms.uAmplitude, this.particleFlag.material.uniforms.uBend], {
                value: 0,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        tl.to(
            this.particleFlag.material.uniforms.uMaxAlpha, {
                value: 0.8,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        tl.to(
            this.particleFlag.material.uniforms.uScale, {
                value: s + 0.2,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        tl.add(() => {
            this.fadeIn(true)

            this.stick.fadeOut()
            this.title.fadeOut()

            if (this.subtitle) {
                this.subtitle.fadeOut()
            }
        }, 0)

        tl.add(() => {
            this.canHoverMenu = true
        }, 1)

        tl.to(object.position, {
            y: this.position.y + 40,
            duration,
            ease: 'expo.out'
        }, 0)

        this.tlMenuView = tl
    }

    toRoadview(fromMenu) {
        this.tlMenuView ? .kill()
        const object = this.particleFlag.object3d
        object.updateMatrix()
        const duration = TRANSITION_MENU_MAX_DURATION
        const s = 1
        this.particleFlag.placeOnRoad(this, false)

        const tl = new TimelineLite({
            onComplete: () => {
                this.canHoverMenu = false
                this.canRender = true

                sortPoints(this.particleFlag, CameraController.camera)
            },
        })

        const obj = {
            value: 1,
        }

        tl.to(
            obj, {
                value: 0,
                duration: fromMenu ? 0 : duration - 1,
                ease: 'expo.out',
                onUpdate: () => {
                    object.scale.set(
                        s + (SCALE_MENU_VIEW - 1) * obj.value,
                        s + (SCALE_MENU_VIEW - 1) * obj.value,
                        s + (SCALE_MENU_VIEW - 1) * obj.value,
                    )
                    this.particleFlag.material.uniforms.uMenuViewProgress.value = obj.value
                },
            },
            0,
        )

        if (!fromMenu) {
            tl.to(
                this.particleFlag.material.uniforms.uAmplitude, {
                    value: this.particleFlag.guiController.uAmplitude,
                    duration,
                    ease: 'expo.out',
                },
                0,
            )

            tl.to(
                this.particleFlag.material.uniforms.uBend, {
                    value: this.particleFlag.guiController.uBend,
                    duration,
                    ease: 'expo.out',
                },
                0,
            )
        }

        tl.to(
            this.particleFlag.material.uniforms.uScale, {
                value: s,
                duration: fromMenu ? 0 : duration,
                ease: 'expo.out',
            },
            0,
        )

        if (this.isVisible || fromMenu) {
            this.loadTextureFirst(this.particleFlag.textures[this.particleFlag.sliderIndex])

            this.stick.fadeIn()
            this.title.fadeIn()

            if (this.subtitle) {
                this.subtitle.fadeIn()
            }
        } else {
            this.fadeOut(false, true)
        }

        this.tlDefaultView = tl
    }

    circleToFlag() {
        this.flagToCircleTl ? .kill()
        this.flagToCircleTl = null
        if (this.circleToFlagAnimated || this.zoomed || !this.canHoverMenu) return
        this.circleToFlagAnimated = true
        this.flagToCircleAnimated = false

        const duration = 1.15

        this.circleToFlagTl = new TimelineLite({
            onComplete: () => {
                this.circleToFlagAnimated = false
                if (this.type === 'list') {
                    sortPoints(this.particleFlag, CameraController.camera)
                }
            },
        })
        this.circleToFlagTl.to(
            this.particleFlag.material.uniforms.uMenuViewHoverProgress, {
                value: 1,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        this.circleToFlagTl.add(() => {
            this.loadTextureFirst(this.particleFlag.textures[this.particleFlag.sliderIndex])
        }, 0.2)
    }

    flagToCircle() {
        this.circleToFlagTl ? .kill()
        this.circleToFlagTl = null
        if (this.flagToCircleAnimated || this.zoomed || !this.canHoverMenu) return
        this.flagToCircleAnimated = true
        this.circleToFlagAnimated = false

        const duration = 1

        this.flagToCircleTl = new TimelineLite()
        this.flagToCircleTl.to(
            this.particleFlag.material.uniforms.uMenuViewHoverProgress, {
                value: 0,
                duration,
                ease: 'expo.out',
            },
            0,
        )

        const {
            video
        } = this.particleFlag.textures[this.particleFlag.sliderIndex]

        if (video) {
            if (isVideoPlaying(video)) {
                video.pause()
            }
        }
    }

    goNext() {
        this.particleFlag.goNext()
        this.nextMesh.onClick()
    }

    goPrev() {
        this.particleFlag.goPrev()
        this.prevMesh.onClick()
    }
}