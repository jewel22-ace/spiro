export default class SpitText {
    constructor(el, listview = false) {
        this.el = el
        const arr = el.innerHTML.split('')
        el.innerHTML = ''
        arr.forEach(char => {
            const span = document.createElement('span')
            span.classList.add('split-text__letter')
            if (char === ' ') {
                span.classList.add('split-text__letter--space')
            }
            if (listview) {
                span.classList.add('split-text__letter--listview')
            }
            span.innerHTML = char
            el.appendChild(span)
        })
    }

    show() {
        this.el.classList.add('is-visible')
    }
}