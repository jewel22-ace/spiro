import RaycasterManager from '../../../managers/RaycasterManager'
import Social from './Social'
import FOOTER from '~data/footer'

export default class Socials {
    object3D = new THREE.Object3D()
    items = []
    constructor(context, position, lookAt) {
        const margin = 3
        let offset = -margin

        FOOTER.socials.forEach(asset => {
            const social = new Social(asset.name, asset.link)
            social.object3D.position.x += offset
            offset += margin

            this.object3D.add(social.object3D)

            this.items.push(social)
        })

        this.object3D.position.copy(position)
        this.object3D.lookAt(lookAt)
        context.add(this.object3D)

        document.body.addEventListener('click', this.handleClick)
    }

    handleClick = e => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        RaycasterManager.mouse.x = x
        RaycasterManager.mouse.y = y

        RaycasterManager.updateCurrentIntersect({
            x,
            y
        })

        if (RaycasterManager.currentIntersect) {
            const {
                name
            } = RaycasterManager.currentIntersect.object
            this.items.forEach((item, index) => {
                if (name === `social-${FOOTER.socials[index].name}`) {
                    item.onClick()
                }
            })
        }
    }

    fadeIn() {
        const faceMeshes = []
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            item.fadeIn(i * 0.1)
            faceMeshes.push(item.faceMesh)
        }

        RaycasterManager.updateObserver({
            socials: faceMeshes
        })
    }

    fadeOut() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            item.fadeOut()
        }
        RaycasterManager.updateObserver({
            socials: []
        })
    }
}