// Managers
import '~managers/RAFManager'
import '~managers/ResizeManager'
import '~managers/ScrollManager'
import '~managers/RotateDeviceManager'
import '~utils/GSAPease'

// Scene
import Scene from './components/Scene'

;
(() => {
    window.scrollTo(0, 0)
    // scene
    const sceneEl = document.querySelector('[data-scene-canvas]')
    new Scene(sceneEl)
})()