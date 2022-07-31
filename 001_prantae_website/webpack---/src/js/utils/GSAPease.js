import gsap from 'gsap'
import {
    CustomEase
} from './CustomEase'

gsap.registerPlugin(CustomEase)

CustomEase.create('smooth.y', '0.00, 0.16, 1.00, 1.00')
CustomEase.create('smooth.x', '0.00, 0.00, 0.42, 1.00')
CustomEase.create('bounce.out', '0.22, 1.4, 0.36, 1')
CustomEase.create('bounce.in', '0.43, 0.00, 0.79, -0.28')
CustomEase.create('quart', '0.76, 0.00, 0.24, 1.00')
CustomEase.create('quart.in', '0.52, 0.00, 0.74, 0.00')
CustomEase.create('quart.out', '0.26, 1.00, 0.48, 1.00')
CustomEase.create('quint', '0.84, 0.00, 0.16, 1.00')
CustomEase.create('quint.in', '0.64, 0.00, 0.78, 0.00')
CustomEase.create('quint.out', '0.22, 1.00, 0.36, 1.00')
CustomEase.create('expo', '1, 0, 0, 1')
CustomEase.create('expo.in', '0.95, 0.05, 0.795, 0.035')
CustomEase.create('expo.out', '0.19, 1, 0.22, 1')
CustomEase.create('quad', '0.455, 0.03, 0.515, 0.955')
CustomEase.create('quad.in', '0.55, 0.085, 0.68, 0.53')
CustomEase.create('quad.out', '0.165, 0.84, 0.44, 1')