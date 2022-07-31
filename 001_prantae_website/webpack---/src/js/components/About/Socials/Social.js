import LoaderManager from '~managers/LoaderManager'
// import * as THREE from 'three'
import {
    CIRCLE_GEO
} from '~constants'
import {
    degToRad
} from '~utils/three'
import {
    TimelineLite
} from 'gsap/all'
import {
    COLORS_ABOUT
} from '../../../constants'

const CYLINDER_HEIGHT = 0.6
const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, CYLINDER_HEIGHT, 32)
const SCALE = 1

export default class Social {
    object3D = new THREE.Object3D()
    constructor(asset, link) {
        const {
            texture
        } = LoaderManager.subjects[asset]
        const faceMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            map: texture
        })
        this.faceMesh = new THREE.Mesh(CIRCLE_GEO, faceMat)
        this.faceMesh.name = `social-${asset}`
        this.link = link
        this.faceMesh.position.z = CYLINDER_HEIGHT / 2 + 0.04
        // if (type === 'prev') {
        //   this.faceMesh.scale.set(1, -1, 1)
        // }

        // this.faceMesh.visible = false
        const color = COLORS_ABOUT[0]

        const cylinderMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`),
            transparent: true,
            opacity: 0,
        })

        this.cylinderMesh = new THREE.Mesh(CYLINDER_GEO, cylinderMat)
        this.cylinderMesh.rotation.x += degToRad(-90)

        this.object3D.add(this.cylinderMesh)
        this.object3D.add(this.faceMesh)
        const s = SCALE
        this.object3D.scale.set(s, s, s)
    }

    fadeOut() {
        const duration = 1
        this.tlFadeIn ? .kill()
        this.tlFadeOut = new TimelineLite()
        this.tlFadeOut.to(this.cylinderMesh.material, {
            opacity: 0,
            duration
        }, 0)
        this.tlFadeOut.to(this.faceMesh.material, {
            opacity: 0,
            duration
        }, 0)
    }

    fadeIn(staggerDelay) {
        const delay = 1.1 + staggerDelay
        const duration = 0.8
        this.tlFadeOut ? .kill()
        this.tlFadeIn = new TimelineLite()
        this.tlFadeIn.to(this.cylinderMesh.material, {
            opacity: 1,
            duration
        }, delay)
        this.tlFadeIn.to(this.faceMesh.material, {
            opacity: 1,
            duration
        }, delay)
    }

    onClick = () => {
        this.tlClick ? .kill()
        const duration = 0.3
        const obj = {
            value: SCALE
        }
        this.tlClick = new TimelineLite()
        this.tlClick.to(obj, {
            value: 0.1,
            duration,
            onUpdate: () => {
                this.object3D.scale.set(SCALE, SCALE, obj.value)
            },
        })

        this.tlClick.to(obj, {
            value: SCALE,
            duration: 0.3,
            onUpdate: () => {
                this.object3D.scale.set(SCALE, SCALE, obj.value)
            },
        })

        this.tlClick.add(() => {
            window.open(this.link, '_blank').focus()
        }, 0.3)
    }
}