import projectTemplate from '../../views/project.mustache'
import PROJECTS from '~data/projects'
import FOOTER from '~data/footer'
import labTemplate from '../../views/lab.mustache'
import LABS from '~data/labs'
import ProjectBackCta from '~components/ProjectBackCta/ProjectBackCta'
import listviewTemplate from '../../views/listview.mustache'
import menuTemplate from '../../views/menu.mustache'
import footerTemplate from '../../views/footer.mustache'
import {
    GO_TO_PROJECT,
    DELAY_MENU_TO_PROJECT
} from '~constants/'
import IntroButton from '../components/IntroButton/IntroButton'
import SplitText from '../components/SplitText/SplitText'
import {
    DELAY_TRANSITION_PROJECT_SIDE,
    LISTVIEW_TYPE,
    OVERVIEW_TYPE,
    ROAD_TYPE,
    SWITCH_VIEW
} from '../constants'

import Listview from '../components/Listview/Listview'
import MenuManager from './MenuManager'
import ResizeManager from './ResizeManager'
import Equalizer from '../components/Equalizer/Equalizer'

class TemplateManager {
    constructor() {
        this.targetProject = document.querySelector('[data-scene-project]')
        this.targetAbout = document.querySelector('[data-scene-about]')
        this.targetMenu = document.querySelector('[data-scene-menu]')
        this.targetIntro = document.querySelector('[data-intro]')
        this.targetFooter = document.querySelector('[data-scene-footer]')
        this.targetListview = document.querySelector('[data-scene-listview]')

        this.elScrollText = document.querySelector('[data-scroll-text]')
        this.touchZone = document.querySelector('[data-touch-zone]')
        this.overlay = document.querySelector('[data-scene-overlay]')

        this.projectBackCta = new ProjectBackCta()
        this.introButton = new IntroButton()
        this.listview = new Listview(this.targetListview)

        window.addEventListener(GO_TO_PROJECT, e => {
            const {
                directionCenter,
                flagIndex,
                type,
                fromMenuView
            } = e.detail
            this.transitionInProject(directionCenter, flagIndex, type, fromMenuView)
        })

        window.addEventListener(SWITCH_VIEW, e => {
            const {
                type
            } = e.detail
            if (type === OVERVIEW_TYPE || type === ROAD_TYPE) {
                this.transitionOutListview()
            }

            if (type === OVERVIEW_TYPE || type === LISTVIEW_TYPE) {
                this.hideFooterIndicator()
                this.showOverlay()
            } else {
                this.showFooterIndicator()
                this.hideOverlay()
            }
        })

        this.transitionInIntro()
    }

    transitionInProject(dir, index, type, fromMenuView) {
        this.targetProject.classList.remove('is-left')
        this.targetProject.classList.remove('is-right')
        this.targetProject.classList.remove('is-project')
        this.targetProject.classList.remove('is-lab')

        let sideClass = 'is-left'
        if (dir === 1) {
            sideClass = 'is-right'
        }

        if (ResizeManager.isTouch) {
            this.touchZone.classList.remove('is-left')
            this.touchZone.classList.remove('is-right')
            this.touchZone.classList.add(sideClass)
        }

        this.targetProject.classList.add(sideClass)
        this.targetProject.classList.add(`is-${type}`)
        this.updateProjects(index, type)
        const elSplittedText = this.targetProject.querySelector('[data-split-text]')
        const splittedText = new SplitText(elSplittedText)
        const elAppears = this.targetProject.querySelectorAll('[data-appear]')

        const delay = fromMenuView ? DELAY_MENU_TO_PROJECT : 0
        setTimeout(() => {
            this.hideFooter()
            this.targetProject.classList.add('is-visible')

            setTimeout(() => {
                splittedText.show()
                elAppears.forEach(el => {
                    if (dir === 1) {
                        el.classList.add('is-right')
                    } else {
                        el.classList.add('is-left')
                    }
                    setTimeout(() => el.classList.add('is-visible'), 100)
                })
            }, 400)
        }, delay * 1000)
    }

    transitionOutProject() {
        setTimeout(() => {
            this.targetProject.classList.remove('is-visible')
            this.showFooter()
            this.projectBackCta.destroy()
        })
    }

    updateProjects(index, type) {
        // transition
        let html
        if (type === 'project') {
            html = projectTemplate(PROJECTS[index])
        } else if (type === 'lab') {
            html = labTemplate(LABS[index - PROJECTS.length])
        }
        this.targetProject.innerHTML = html

        setTimeout(() => {
            const projectBackCtaDOM = this.targetProject.querySelector('[data-project-back-cta]')
            this.projectBackCta.reset(projectBackCtaDOM)
            const clickableAreas = this.targetProject.querySelectorAll('.project__block')
            clickableAreas.forEach(el => {
                el.addEventListener('click', e => {
                    e.stopPropagation()
                })
            })
        }, DELAY_TRANSITION_PROJECT_SIDE * 1000)
    }

    transitionInSidebar() {
        this.targetMenu.innerHTML = menuTemplate()
        this.menu = new MenuManager(this)
        setTimeout(() => {
            this.targetMenu.classList.add('is-visible')
        }, 2500)
    }

    transitionInFooter() {
        this.targetFooter.innerHTML = footerTemplate(FOOTER)
        this.equalizer = new Equalizer()
        setTimeout(() => {
            this.showFooter()
            this.showFooterIndicator()
        }, 2500)
    }

    transitionInListview() {
        const obj = {
            projects: PROJECTS,
            labs: LABS,
        }
        this.targetListview.innerHTML = listviewTemplate(obj)
        setTimeout(() => {
            this.listview.init()
        })
    }

    transitionOutListview() {
        this.listview.el.classList.remove('is-visible')
        setTimeout(() => {
            this.listview.destroy()
            this.targetListview.innerHTML = ''
        }, 500)
    }

    transitionInIntro() {
        // this.targetIntro.innerHTML = introTemplate()
        this.targetIntro.style.opacity = 1
        const buttonEl = document.querySelector('[data-intro-button]')
        this.introButton.reset(buttonEl)
    }

    hideScrollText() {
        // if (this.elScrollTextHidden) return
        // this.elScrollTextHidden = true
        this.elScrollText.style.opacity = 0
        this.elScrollText.classList.add('is-hidden')
    }

    showScrollText() {
        this.elScrollText.style.opacity = 0.6
        this.elScrollText.classList.remove('is-hidden')
        this.menu.canSwitch = true
    }

    showFooter() {
        this.targetFooter.classList.add('is-visible')
    }

    hideFooter() {
        this.targetFooter.classList.remove('is-visible')
    }

    showFooterIndicator() {
        this.targetFooter.classList.add('show-indicator')
    }

    hideFooterIndicator() {
        this.targetFooter.classList.remove('show-indicator')
    }

    showOverlay() {
        this.overlay.classList.add('is-visible')
    }

    hideOverlay() {
        this.overlay.classList.remove('is-visible')
    }
}

export default new TemplateManager()