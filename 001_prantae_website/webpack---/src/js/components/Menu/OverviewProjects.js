// import Item from './Item'
import PROJECTS from '~data/projects'
import LABS from '~data/labs'
import {
    TimelineLite
} from 'gsap/gsap-core'

export default class OverviewProjects {
    constructor(el) {
        this.el = el

        this.titleEl = this.el.querySelector('[data-overview-projects-title]')
        this.subtitleEl = this.el.querySelector('[data-overview-projects-subtitle]')
    }

    updateText(index) {
        this.tlRemove ? .kill()
        this.tlUpdate = new TimelineLite()
        let data

        const duration = 0.2

        this.titleEl.classList.remove('is-lab')
        this.titleEl.classList.remove('is-project')

        if (index >= PROJECTS.length) {
            // lab type
            data = LABS[index - PROJECTS.length]
            this.titleEl.classList.add('is-lab')
        } else {
            // project type
            data = PROJECTS[index]
            this.titleEl.classList.add('is-project')
        }

        this.tlUpdate.to([this.titleEl, this.subtitleEl], {
            opacity: 0,
            duration,
        })

        this.tlUpdate.add(() => {
            this.titleEl.innerHTML = data.title
            if (data.subtitle) {
                this.subtitleEl.innerHTML = data.subtitle
            } else {
                this.subtitleEl.innerHTML = ''
            }
            this.el.classList.remove('is-scaled')
        })

        this.tlUpdate.fromTo(
            [this.titleEl, this.subtitleEl], {
                opacity: 0,
            }, {
                opacity: 1,
                duration: duration + 0.6,
            },
            duration + 0.1,
        )

        this.tlUpdate.add(() => {
            this.el.classList.add('is-scaled')
        }, duration + 0.1)
    }

    removeText() {
        const duration = 0.2
        this.tlUpdate ? .kill()
        this.tlRemove = new TimelineLite()
        this.tlRemove.fromTo(
            [this.titleEl, this.subtitleEl], {
                opacity: 1,
            }, {
                opacity: 0,
                duration,
            },
        )

        this.tlRemove.add(() => {
            this.el.classList.remove('is-scaled')
            this.titleEl.innerHTML = ''
            this.subtitleEl.innerHTML = ''
        })
    }
}