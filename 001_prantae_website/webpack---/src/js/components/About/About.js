// import * as THREE from 'three'
import LinesManager from '~managers/LinesManager'
import ScrollManager from '~managers/ScrollManager'
import {
    PORTIONS_ABOUT,
    SCROLL,
    RAF
} from '../../constants'
import Texts from './Texts/Texts'
import {
    degToRad
} from '~utils/three'
import Stick from '../Flags/Stick/Stick'
import Socials from './Socials/Socials'

export default class About {
    object3D = new THREE.Object3D()
    isVisible = false
    scrollValue = PORTIONS_ABOUT - 0.115
    constructor(scene) {
        this.scene = scene
        const offsetRadius = 0
        const radius = 100

        const {
            points
        } = LinesManager.mainRoad
        const {
            angle,
            position: pointPosition,
            center
        } = points[Math.round(points.length * this.scrollValue)]

        // use that to change element to opposite way
        let dirOppositeWay = 1

        const x = Math.cos(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius) + center.x
        const z = Math.sin(degToRad(angle)) * (radius + dirOppositeWay * offsetRadius)
        this.position = new THREE.Vector3(x, pointPosition.y, z)

        // meshLine
        // lookAt a little bit before the current point
        this.lookAt = LinesManager.mainTrail.getPoint(Math.max(0, this.scrollValue - 0.02))
        this.init()

        window.addEventListener(SCROLL, this.handleScroll)
        window.addEventListener(RAF, this.handleRAF)
    }

    init() {
        this.stick = new Stick(this.position, this.lookAt, 'about')
        this.texts = new Texts(this.position, this.lookAt)
        this.socials = new Socials(this.object3D, this.position, this.lookAt)

        this.object3D.add(this.stick.object3d)
        this.object3D.add(this.texts.object3d)
        this.scene.add(this.object3D)
    }

    handleScroll = () => {
        const marginFront = 0.11
        const marginBehind = -0.007

        if (
            ScrollManager.progress + marginFront > this.scrollValue &&
            ScrollManager.progress - this.scrollValue < marginBehind
        ) {
            if (!this.isVisible) {
                this.fadeIn()
            }
        } else if (this.isVisible) {
            this.fadeOut()
        }
    }

    fadeIn() {
        this.isVisible = true
        this.texts.fadeIn()
        this.stick.fadeIn()
        this.socials.fadeIn()
    }

    fadeOut() {
        this.isVisible = false
        this.texts.fadeOut()
        this.stick.fadeOut()
        this.socials.fadeOut()
    }

    handleRAF = e => {
        const {
            deltaTime
        } = e.detail
        this.stick.render(deltaTime)
    }
}