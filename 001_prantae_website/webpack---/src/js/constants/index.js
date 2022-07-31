// import * as THREE from 'three'

// events
export const RAF = 'RAF'
export const WINDOW_RESIZE = 'WINDOW_RESIZE'
export const MOUSE_MOVE = 'MOUSE_MOVE'
export const START_SCENE = 'START_SCENE'
export const SCROLL = 'SCROLL'
export const BACK_ON_ROAD = 'BACK_ON_ROAD'
export const SIDEBAR_MOUSEENTER = 'SIDEBAR_MOUSEENTER'
export const SIDEBAR_MOUSELEAVE = 'SIDEBAR_MOUSELEAVE'
export const SWITCH_VIEW = 'SWITCH_VIEW'
export const GO_TO_PROJECT = 'GO_TO_PROJECT'
export const GO_TO_PROJECT_FROM_MENU = 'GO_TO_PROJECT_FROM_MENU'
export const GO_TO_MENU_FROM_PROJECT = 'GO_TO_MENU_FROM_PROJECT'
export const OVERLAY_TRANSITION = 'OVERLAY_TRANSITION'
export const OVERLAY_INTRO_OUT = 'OVERLAY_INTRO_OUT'
export const CLICK_INTRO_BUTTON = 'CLICK_INTRO_BUTTON'
export const AUTO_SCROLLED = 'AUTO_SCROLLED'
export const MOUSE_ENTER_LIST = 'MOUSE_ENTER_LIST'
export const MOUSE_LEAVE_LIST = 'MOUSE_LEAVE_LIST'

// VIEW TYPES
export const ROAD_TYPE = 'ROAD_TYPE'
export const OVERVIEW_TYPE = 'OVERVIEW_TYPE'
export const LISTVIEW_TYPE = 'LISTVIEW_TYPE'
export const INTRO_TYPE = 'INTRO_TYPE'

// BREAKPOINTS
export const MOBILE_BREAKPOINT = 'MOBILE_BREAKPOINT'
export const TABLET_BREAKPOINT = 'TABLET_BREAKPOINT'
export const DESKTOP_BREAKPOINT = 'DESKTOP_BREAKPOINT'

// Threejs
export const PROJECT_STICK_HEIGHT = 16
export const PROJECT_STICK_HEIGHT_AB = 3
export const PLANE_GEO = new THREE.PlaneBufferGeometry(1, 1)
export const PLANE_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    visible: false
})

export const CIRCLE_GEO = new THREE.CircleGeometry(1, 60)
export const CIRCLE_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0x000000,
    visible: false
})

// PORTIONS
export const PORTIONS_PROJECTS = 0.5
export const PORTIONS_LABS = 0.75
export const PORTIONS_ABOUT = 1

// Transition Menu duration
export const TRANSITION_MENU_MAX_DURATION = 3.1
export const DELAY_MENU_TO_PROJECT = 1
export const DELAY_TRANSITION_PROJECT_SIDE = 1.4
export const DELAY_INTRO_START_CAMERA = 1

// COLORS

export const COLORS_PROJECT = [{
        r: 116,
        g: 156,
        b: 255
    },
    {
        r: 98,
        g: 139,
        b: 255
    },
]

export const COLORS_LAB = [{
        r: 245,
        g: 181,
        b: 158
    },
    {
        r: 245,
        g: 198,
        b: 178
    },
]

export const COLORS_ABOUT = [{
        r: 98,
        g: 203,
        b: 98
    },
    {
        r: 105,
        g: 220,
        b: 128
    },
]

export const DARK_GREY = 0x434343

// GL Z INDEX
export const RENDER_ORDER_S_TITLES = 1000
export const RENDER_ORDER_OVERLAY = 1010

export const RENDER_ORDER_MESHLINES = 1