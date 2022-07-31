import fragmentShader from './glsl.frag'
import vertexShader from './glsl.vert'

const DisplacementShader = {
    uniforms: {
        tDiffuse: {
            value: null
        },
        uTime: {
            value: 1.0
        },
        uForce: {
            value: 6.0
        },
        uProgressSide: {
            value: 0.0
        },
        uDisplaceMap: {
            value: null
        },
        uResolution: {
            value: null
        },
        uAccelerate: {
            value: 1.0
        },
        uBgColor: {
            value: null
        },
        uDirection: {
            value: -1.0
        },
        uLighten: {
            value: 0.0
        },
    },

    vertexShader,

    fragmentShader,
}

export {
    DisplacementShader
}