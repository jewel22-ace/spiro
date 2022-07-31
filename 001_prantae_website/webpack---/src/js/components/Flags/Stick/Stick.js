import {
    BufferGeometry,
    Line,
    LineBasicMaterial,
    Mesh,
    Object3D,
    PlaneBufferGeometry,
    Vector3,
    RawShaderMaterial,
} from 'three'
import glsl from 'glslify'
import fragmentShader from './point.frag'
import vertexShader from './point.vert'
import {
    PROJECT_STICK_HEIGHT,
    PROJECT_STICK_HEIGHT_AB
} from '~constants/'
import {
    TimelineLite
} from 'gsap/gsap-core'

const POINT_SIZE = 5
const POINT_GEOMETRY = new PlaneBufferGeometry(POINT_SIZE, POINT_SIZE, 1, 1)
POINT_GEOMETRY.center()

const points = []
points.push(new Vector3(0, 0, 0))
points.push(new Vector3(0, PROJECT_STICK_HEIGHT, 0))

const MAX_OPACITY = 0.6

const LINE_GEOMETRY = new BufferGeometry().setFromPoints(points)

const POINT_SIZE_AB = 3

const POINT_GEOMETRY_AB = new PlaneBufferGeometry(POINT_SIZE_AB, POINT_SIZE_AB, 1, 1)
POINT_GEOMETRY_AB.center()

const pointsAbout = []
pointsAbout.push(new Vector3(0, 0, 0))
pointsAbout.push(new Vector3(0, PROJECT_STICK_HEIGHT_AB + 2, 0))

const LINE_GEOMETRY_ABOUT = new BufferGeometry().setFromPoints(pointsAbout)

const S0 = 0.001
export default class Stick {
    object3d = new Object3D()
    constructor(position, lookAt, type) {
        this.type = type
        this.maxOpacity = type === 'about' ? 0.8 : MAX_OPACITY
        this.object3d.position.copy(position)
        this.createLine()
        if (type !== 'about') {
            this.createPoint()
        }

        this.object3d.lookAt(lookAt)
    }

    createLine() {
        this.lineMaterial = new LineBasicMaterial({
            color: 0x434343,
            transparent: true,
            opacity: 0
        })
        const geometry = this.type === 'about' ? LINE_GEOMETRY_ABOUT : LINE_GEOMETRY
        const line = new Line(geometry, this.lineMaterial)

        this.object3d.add(line)
    }

    createPoint() {
        this.uniforms = {
            uRippleProgress: {
                value: 0.0,
            },
            uAlpha: {
                value: 0.0,
            },
        }

        this.pointMaterial = new RawShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: glsl(vertexShader),
            fragmentShader: glsl(fragmentShader),
            transparent: true,
            depthWrite: false,
        })

        if (this.type === 'about') {
            this.pointMesh = new Mesh(POINT_GEOMETRY_AB, this.pointMaterial)
            this.pointMesh.position.y += PROJECT_STICK_HEIGHT_AB + POINT_SIZE_AB / 3
        } else {
            this.pointMesh = new Mesh(POINT_GEOMETRY, this.pointMaterial)
            this.pointMesh.position.y += PROJECT_STICK_HEIGHT + POINT_SIZE / 3
        }

        this.pointMesh.name = 'stick-point'

        this.object3d.add(this.pointMesh)
    }

    render(deltaTime) {
        if (this.canRipple && this.pointMesh) {
            this.uniforms.uRippleProgress.value += deltaTime / 200.0
        }
    }

    fadeIn() {
        this.tlFadeOut ? .kill()
        this.object3d.scale.set(1, S0, 1)
        this.pointMesh ? .scale.set(S0, S0, S0)
        const duration = 1.2
        const durationOpacity = 1
        const delay = this.type === 'about' ? 1.3 : 0
        const tl = new TimelineLite({
            delay
        })
        const obj = {
            value: S0,
        }

        tl.to(
            obj, {
                value: 1,
                ease: 'bounce.out',
                duration,
                onUpdate: () => {
                    this.object3d.scale.set(1, obj.value, 1)
                },
            },
            0,
        )

        if (this.pointMaterial) {
            tl.to(
                this.pointMaterial.uniforms.uAlpha, {
                    value: this.maxOpacity,
                    duration: durationOpacity,
                    ease: 'linear',
                },
                0,
            )
        }

        tl.to(
            this.lineMaterial, {
                opacity: this.maxOpacity,
                duration: durationOpacity,
                ease: 'linear',
            },
            0,
        )

        const obj2 = {
            value: S0,
        }

        tl.to(
            obj2, {
                value: 1,
                ease: 'bounce.out',
                duration,
                onUpdate: () => {
                    this.pointMesh ? .scale.set(obj2.value, obj2.value, obj2.value)
                },
            },
            0.6,
        )

        tl.add(() => {
            this.canRipple = true
        }, '-=0.6')

        this.tlFadeIn = tl
    }

    fadeOut() {
        this.tlFadeIn ? .kill()
        const duration = 0.5
        const tl = new TimelineLite()

        if (this.pointMaterial) {
            tl.to(
                this.pointMaterial.uniforms.uAlpha, {
                    value: 0,
                    duration,
                    ease: 'linear',
                },
                0,
            )
        }

        tl.to(
            this.lineMaterial, {
                opacity: 0,
                duration,
                ease: 'linear',
            },
            0,
        )

        tl.add(() => {
            this.canRipple = false
            if (this.pointMaterial) this.uniforms.uRippleProgress.value = 0
            this.object3d.scale.set(1, S0, 1)
        })

        this.tlFadeOut = tl
    }
}