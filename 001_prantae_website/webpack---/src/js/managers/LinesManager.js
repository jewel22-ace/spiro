// import GUI from '~components/Gui'
import {
    degToRad
} from '~utils/three'
import {
    randomFloat
} from '~utils/math'
import ParticlesLine from '~components/Road/ParticlesLine'
import {
    Vector3,
    CatmullRomCurve3
} from 'three'
import Line from '../components/Road/Line'

const MAX_RADIUS = 100
const Y_RANGE = 26

class LinesManager {
    guiController = {
        offset360: 15,
        radius: 100,
        lineWidth: 0.1,
        lineNbPoint: 250,
        coefY: 0.1,
        showSpheres: true,
    }

    constructor() {
        this.createCenters()
        this.mainRoad = this.createLine()
        const {
            extraPoints
        } = this.mainRoad
        this.mainTrail = new CatmullRomCurve3(extraPoints)
    }

    // initGUI(guiChange) {
    //   // gui

    //   const folder = GUI.addFolder('Lines')

    //   folder.add(this.guiController, 'offset360', 0, 360).onChange(guiChange)
    //   folder.add(this.guiController, 'radius', 0, 360).onChange(guiChange)
    //   folder
    //     .add(this.guiController, 'lineWidth', 0, 10)
    //     .onChange(guiChange)
    //     .step(0.1)
    //   folder.add(this.guiController, 'lineNbPoint', 0, 2000).onChange(guiChange)

    //   folder
    //     .add(this.guiController, 'coefY', 0, 2)
    //     .onChange(guiChange)
    //     .step(0.1)
    //   folder.add(this.guiController, 'showSpheres').onChange(guiChange)
    // }

    createCenters() {
        this.lineMaterials = []

        let posX = -MAX_RADIUS * 2

        this.circleCenters = []

        for (let i = 0; i < 3; i++) {
            const vec3 = new Vector3(posX, 0, 0)
            posX += MAX_RADIUS * 2

            this.circleCenters.push(vec3)
        }
    }

    createLine({
        particle = false,
        line = false,
        offsetY = 0,
        radius = this.guiController.radius,
        offsetRadius = 0,
        ext = false,
        globalIndex = 0,
    } = {}) {
        // Points
        let points = []

        /*
         ** First circle
         */
        const radiusExt = ext ? -1 : 1

        const circlesPoints = []

        let nbPoints = 100
        const inc = 360 / nbPoints
        const yRange = Y_RANGE
        const incY = yRange / nbPoints

        for (let j = 0; j < this.circleCenters.length; j++) {
            const circleCenter = this.circleCenters[j]
            let angle = 180 - inc
            const arrPoints = []
            let y = 0

            if (j === 0) {
                y = 0
            } else if (j === 1) {
                y = -yRange / 2
            } else if (j === 2) {
                y = -yRange / 2
            }

            for (let i = 0; i < nbPoints; i++) {
                const finalAngle = angle + inc
                const vec3 = new Vector3(0, 0, 0)
                let dir = 1
                if (j === 1) {
                    dir = -1
                }
                vec3.x = Math.cos(degToRad(finalAngle)) * (radius - offsetRadius * dir * radiusExt) + circleCenter.x
                vec3.y = y + offsetY
                vec3.z = Math.sin(degToRad(finalAngle)) * (radius - offsetRadius * dir * radiusExt)
                angle += inc

                let color

                if (j === 0) {
                    color = 'red'
                    y += incY
                    if (i + 1 === nbPoints / 2) {
                        y = -yRange / 2
                    }
                } else if (j === 1) {
                    color = 'green'
                    let coef = 2
                    if (i === 0) {
                        vec3.y = yRange / 2 + offsetY - incY
                        // coef = 1
                    }
                    y += incY * coef
                    if (i === nbPoints / 2) {
                        y = -yRange / 2
                    }
                } else if (j === 2) {
                    color = 'blue'
                    y += incY
                }

                arrPoints.push({
                    position: vec3,
                    center: circleCenter,
                    angle: finalAngle,
                    directionCenter: -1 * dir,
                    color,
                })
            }

            circlesPoints.push(arrPoints)
        }

        circlesPoints[1].reverse()

        const halfNb = nbPoints / 2
        const arr1LastElRemoved = this.getLast(circlesPoints[1], halfNb)
        arr1LastElRemoved.pop()

        points = [
            ...this.getFirst(circlesPoints[0], halfNb),
            circlesPoints[1][nbPoints - 1],
            ...this.getFirst(circlesPoints[1], halfNb - 1),
            ...circlesPoints[2],
            circlesPoints[1][halfNb - 1],
            ...arr1LastElRemoved,
            ...this.getLast(circlesPoints[0], halfNb),
            circlesPoints[0][0],
        ]

        const coefExtraPoints = line ? 3.4 : 1

        const {
            extraPoints,
            lines,
            particles
        } = this.createTrail({
            points,
            particle,
            line,
            globalIndex,
            coefExtraPoints
        })

        const speed = randomFloat(0.00005, 0.0001)

        return {
            points,
            extraPoints,
            speed,
            particles,
            lines,
        }
    }

    createTrail({
        points,
        particle,
        line,
        globalIndex,
        menuViewOnly,
        coefExtraPoints = 1
    }) {
        /*
         ** Create Trail / meshLine if needed
         */
        const positions = points.map(points => points.position)
        const extraPoints = new CatmullRomCurve3(positions).getPoints(this.guiController.lineNbPoint * coefExtraPoints)
        let particles, lines

        if (particle) {
            particles = new ParticlesLine(extraPoints, globalIndex, menuViewOnly)
        } else if (line) {
            lines = [
                new Line(extraPoints, globalIndex),
                new Line(extraPoints, globalIndex, 0.75),
                new Line(extraPoints, globalIndex, 0.5),
                new Line(extraPoints, globalIndex, 0.25),
            ]
        }

        return {
            extraPoints,
            lines,
            particles,
        }
    }

    getFirst(arr, nb = 5) {
        return arr.slice(0, nb)
    }

    getLast(arr, nb = 5) {
        return arr.slice(Math.max(arr.length - nb, 1))
    }
}

export default new LinesManager()