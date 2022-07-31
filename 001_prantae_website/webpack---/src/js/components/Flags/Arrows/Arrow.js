import LoaderManager from '~managers/LoaderManager'
// import * as THREE from 'three'
import {
    CIRCLE_GEO,
    COLORS_PROJECT,
    COLORS_LAB
} from '~constants'
import {
    degToRad
} from '~utils/three'
import {
    TimelineLite
} from 'gsap/all'

const CYLINDER_HEIGHT = 0.6
const CYLINDER_GEO = new THREE.CylinderGeometry(1, 1, CYLINDER_HEIGHT, 32)
const SCALE = 2

export default class Arrow {
    object3D = new THREE.Object3D()
    constructor(context, type = 'prev', flag) {
        const margin = 4

        const {
            texture
        } = LoaderManager.subjects['arrow']
        const arrowMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            map: texture
        })
        this.arrowMesh = new THREE.Mesh(CIRCLE_GEO, arrowMat)
        this.arrowMesh.name = `project-${context.index}-${type}`
        this.arrowMesh.position.z = CYLINDER_HEIGHT / 2 + 0.04
        if (type === 'prev') {
            this.arrowMesh.scale.set(1, -1, 1)
        }

        // this.arrowMesh.visible = false
        let color = COLORS_PROJECT[0]
        if (flag.type === 'lab') {
            color = COLORS_LAB[0]
        }

        const cylinderMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`rgb(${color.r}, ${color.g}, ${color.b})`),
            transparent: true,
            opacity: 0,
        })

        this.cylinderMesh = new THREE.Mesh(CYLINDER_GEO, cylinderMat)
        this.cylinderMesh.rotation.x += degToRad(-90)

        this.object3D.add(this.cylinderMesh)
        this.object3D.add(this.arrowMesh)

        const s = SCALE
        this.object3D.scale.set(s, s, s)

        this.object3D.position.copy(flag.object3d.position)
        if (type === 'next') {
            this.object3D.position.y += flag.height / 2 + margin
        } else if (type === 'prev') {
            this.object3D.position.y -= flag.height / 2 + margin
        }

        this.object3D.rotation.copy(flag.object3d.rotation)

        context.object3d.add(this.object3D)
    }

    fadeArrowOut() {
        const duration = 0.2
        const tl = new TimelineLite()
        tl.to(this.cylinderMesh.material, {
            opacity: 0,
            duration
        }, 0)
        tl.to(this.arrowMesh.material, {
            opacity: 0,
            duration
        }, 0)
    }

    fadeArrowIn() {
        const duration = 0.5
        const tl = new TimelineLite()
        tl.to(this.cylinderMesh.material, {
            opacity: 1,
            duration
        }, 0)
        tl.to(this.arrowMesh.material, {
            opacity: 1,
            duration
        }, 0)
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
    }
}