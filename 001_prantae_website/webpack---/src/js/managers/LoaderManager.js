import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
    TextureLoader
} from 'three'
import loadbmFont from 'load-bmfont'

class LoaderManager {
    constructor() {
        this.subjects = {}

        this.textureLoader = new TextureLoader()
        this.GLTFLoader = new GLTFLoader()
        this.DRACOLoader = new DRACOLoader()
        this.bmfontLoader = loadbmFont
    }

    load = (objects, callback) => {
        const promises = []
        for (let i = 0; i < objects.length; i++) {
            const {
                name,
                gltf,
                texture,
                img,
                bmfont
            } = objects[i]

            if (!this.subjects[name]) {
                this.subjects[name] = {}
            }

            if (gltf) {
                promises.push(this.loadGLTF(gltf, name))
            }

            if (texture) {
                promises.push(this.loadTexture(texture, name))
            }

            if (img) {
                promises.push(this.loadImage(img, name))
            }

            if (bmfont) {
                promises.push(this.loadBMFont(bmfont, name))
            }
        }

        // this.allProgress(promises, p => {
        //   console.log(p)
        // })

        Promise.all(promises).then(callback)
    }

    // // progress all promise
    // allProgress = (proms, progress_cb) => {
    //   let d = 0
    //   progress_cb(0)
    //   for (const p of proms) {
    //     p.then(() => {
    //       d++
    //       progress_cb((d * 100) / proms.length)
    //     })
    //   }
    //   return Promise.all(proms)
    // }

    loadGLTF(url, name) {
        return new Promise(resolve => {
            this.DRACOLoader.setDecoderPath('../scene/vendor/three/draco/')
            this.GLTFLoader.setDRACOLoader(this.DRACOLoader)

            this.GLTFLoader.load(
                url,
                result => {
                    this.subjects[name].gltf = result
                    resolve(result)
                },
                undefined,
                e => {
                    console.log(e)
                },
            )
        })
    }

    loadTexture(url, name) {
        if (!this.subjects[name]) {
            this.subjects[name] = {}
        }
        return new Promise(resolve => {
            this.textureLoader.load(url, result => {
                this.subjects[name].texture = result
                resolve(result)
            })
        })
    }

    loadImage(url, name) {
        return new Promise(resolve => {
            const image = new Image()

            image.onload = () => {
                this.subjects[name].img = image
                resolve(image)
            }

            image.src = url
        })
    }

    loadBMFont(url, name) {
        return new Promise(resolve => {
            this.bmfontLoader(url, (err, font) => {
                this.subjects[name].bmfont = font
                resolve(font)
            })
        })
    }
}

export default new LoaderManager()