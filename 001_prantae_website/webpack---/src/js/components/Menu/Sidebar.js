import SoundManager, {
    SOUNDS_CONST
} from '../../managers/SoundManager'
import TemplateManager from '../../managers/TemplateManager'

export default class Sidebar {
    constructor(el) {
        this.el = el
        this.aboutEl = this.el.querySelector('[data-sidebar-about]')
        this.listviewEl = this.el.querySelector('[data-sidebar-listview]')
        this.roadviewEl = this.el.querySelector('[data-sidebar-roadview]')

        this.aboutEl.addEventListener('click', this.goToAbout)
        this.listviewEl.addEventListener('click', this.goToListView)
        this.roadviewEl.addEventListener('click', this.goToRoadView)
    }

    goToListView = () => {
        TemplateManager.menu.toListview()
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    goToRoadView = () => {
        TemplateManager.menu.toRoadview({})
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    goToAbout = () => {
        TemplateManager.menu.toRoadview({
            type: 'about'
        })
        SoundManager.trigger(SOUNDS_CONST.CLICK)
    }

    clearActive() {
        this.listviewEl.classList.remove('is-active')
    }
}