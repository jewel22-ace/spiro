// import GUI from '../Gui'
import LinesManager from '~managers/LinesManager'
// import * as THREE from 'three'
import {
    BACK_ON_ROAD,
    GO_TO_MENU_FROM_PROJECT,
    GO_TO_PROJECT
} from '../../constants'
import {
    BG_COLORS,
    MATERIAL
} from './Line'
import {
    TweenLite
} from 'gsap/gsap-core'

const DEBUG_SPHERE = new THREE.SphereGeometry(5, 32, 32)

export default class Road {
    particlesLines = []
    lines = []
    guiController = {
        spaceBetweenLines: 10, // 5
        nbLines: 2,
    }
    canRender = true

    constructor(scene) {
        this.scene = scene

        // this.initGUI()
        this.createParticleLines()

        window.addEventListener(GO_TO_PROJECT, () => (this.canRender = false))
        window.addEventListener(BACK_ON_ROAD, () => (this.canRender = true))
        window.addEventListener(GO_TO_MENU_FROM_PROJECT, () => (this.canRender = true))
    }

    // initGUI() {
    //   // gui
    //   const folder = GUI.addFolder('Road')

    //   folder.add(this.guiController, 'spaceBetweenLines', 0, 100).onChange(this.guiChange)
    //   folder
    //     .add(this.guiController, 'nbLines', 0, 20)
    //     .onChange(this.guiChange)
    //     .step(1)

    //   LinesManager.initGUI(this.guiChange)
    // }

    createParticleLines() {
        let globalIndex = 0

        // Main Line
        const particleLine = LinesManager.createLine({
            particle: true,
            name: 'road'
        })
        const line = LinesManager.createLine({
            line: true,
            name: 'road-line',
            globalIndex: 0
        })

        // // Debug
        // const geometry = new THREE.BufferGeometry().setFromPoints(particleLine.extraPoints)
        // const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
        // // Create the final object to add to the scene
        // const curveObject = new THREE.Line(geometry, material)
        // this.scene.add(curveObject)

        // debug
        line.points.forEach(p => {
            const mat = new THREE.MeshBasicMaterial({
                color: p.color
            })
            const mesh = new THREE.Mesh(DEBUG_SPHERE, mat)
            mesh.position.copy(p.position)
            // this.scene.add(mesh)
        })

        this.particlesLines.push(particleLine)
        this.lines.push(line)

        let inc = this.guiController.spaceBetweenLines
        for (let i = 0; i < this.guiController.nbLines; i++) {
            const particleLine = LinesManager.createLine({
                particle: true,
                offsetRadius: -inc,
                name: 'road'
            })
            const particleLine2 = LinesManager.createLine({
                particle: true,
                offsetRadius: inc,
                name: 'road'
            })
            const line1 = LinesManager.createLine({
                line: true,
                offsetRadius: -inc,
                name: 'road-line',
                globalIndex: globalIndex + 1,
            })
            const line2 = LinesManager.createLine({
                line: true,
                offsetRadius: inc,
                name: 'road-line',
                globalIndex: globalIndex + 2,
            })

            this.particlesLines.push(particleLine)
            this.particlesLines.push(particleLine2)
            this.lines.push(line1)
            this.lines.push(line2)

            inc += this.guiController.spaceBetweenLines
            globalIndex += 2
        }

        // create Circles

        // add lines to scene
        for (let i = 0; i < this.particlesLines.length; i++) {
            const {
                particles
            } = this.particlesLines[i]
            particles.mesh.name = 'road'
            this.scene.add(particles.mesh)
        }

        for (let i = 0; i < this.lines.length; i++) {
            const {
                lines
            } = this.lines[i]
            lines.forEach(line => {
                line.mesh.name = 'road-line'
                this.scene.add(line.mesh)
            })
        }
    }

    introToDefaultView() {
        for (let i = 0; i < this.particlesLines.length; i++) {
            const {
                particles
            } = this.particlesLines[i]
            particles.switchView({
                detail: {
                    type: 'intro'
                }
            })
        }
        for (let i = 0; i < this.lines.length; i++) {
            const {
                lines
            } = this.lines[i]
            lines.forEach(line => {
                line.switchView({
                    detail: {
                        type: 'intro'
                    }
                })
            })
        }
    }

    render(deltaTime) {
        if (!this.canRender) return
        for (let i = 0; i < this.particlesLines.length; i++) {
            const {
                particles
            } = this.particlesLines[i]
            particles.render(deltaTime)
        }

        for (let i = 0; i < this.lines.length; i++) {
            const {
                lines
            } = this.lines[i]
            lines.forEach(line => {
                line.render(deltaTime)
            })
        }
    }

    transitionToColor(currentIndex, nextIndex) {
        // update color of meshline
        const duration = 2
        const currentColor = { ...BG_COLORS[currentIndex]
        }
        const targetColor = { ...BG_COLORS[nextIndex]
        }

        TweenLite.to(currentColor, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'expo.out',
            duration,
            onUpdate: () => {
                const color = new THREE.Color(currentColor.r / 255, currentColor.g / 255, currentColor.b / 255)
                MATERIAL.color = color
                // this.pass.material.uniforms.uBgColor.value = color
            },
        })
    }

    // guiChange = () => {
    //   this.destroy()
    //   this.createParticleLines()
    // }

    destroy() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i]
            if (obj.name === 'road') {
                this.scene.remove(obj)
            }
        }
    }
}