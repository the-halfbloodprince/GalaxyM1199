import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { AdditiveBlending, Float32BufferAttribute } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400,
    closed: true
})

const textureLoader = new THREE.TextureLoader()
const shape = textureLoader.load('/particleShape/1.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


//Galaxy Generator

const parameters = {}

parameters.count = 70000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 8
parameters.spin = 1
parameters.randomness = 0.3
parameters.randomnessPower = 5
parameters.stars = 9000
parameters.starColor = '#1b3984'
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

gui.add(parameters, 'count').min(100).max(100000).step(100).onChange(generateGalaxy)
gui.add(parameters, 'stars').min(0).max(100000).step(100).onChange(generateBgStars)
gui.addColor(parameters, 'starColor').onChange(generateBgStars)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onChange(generateGalaxy)
gui.add(parameters, 'radius').min(1).max(10).step(1).onChange(generateGalaxy)
gui.add(parameters, 'branches').min(1).max(10).step(1).onChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.01).onChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(5).step(1).onChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onChange(generateGalaxy)


let bgStarsGeometry = null
let bgStarsMaterial = null
let bgStars = null

//Background stars
function generateBgStars(){

    if(bgStars!==null){
        bgStarsGeometry.dispose()
        bgStarsMaterial.dispose()
        scene.remove(bgStars)
    }

    bgStarsGeometry = new THREE.BufferGeometry()
    const bgStarsPositions = new Float32Array(parameters.stars * 3)

    for(let j = 0; j<parameters.stars; j++){
        bgStarsPositions[j*3 + 0] = (Math.random() - 0.5) * 20
        bgStarsPositions[j*3 + 1] = (Math.random() - 0.5) * 20
        bgStarsPositions[j*3 + 2] = (Math.random() - 0.5) * 20
    }

    bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgStarsPositions, 3))

    bgStarsMaterial = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        color: parameters.starColor,
        transparent: true,
        alphaMap: shape
    })

    bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial)

    scene.add(bgStars)
}

generateBgStars()




//gALAXY GENerator
let geometry = null
let material = null
let points = null


function generateGalaxy(){

    if(points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count *3)
    const colors = new Float32Array(parameters.count *3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i=0; i<parameters.count; i++){

        //Position
        const x = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI
        const spinAngle = x * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1)

        positions[i*3] = Math.sin(branchAngle + spinAngle) * x + randomX
        positions[i*3 + 1] = randomY
        positions[i*3 + 2] = Math.cos(branchAngle + spinAngle) * x + randomZ

        //Color

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, x / parameters.radius)

        colors[i*3 + 0] = mixedColor.r
        colors[i*3 + 1] = mixedColor.g
        colors[i*3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        vertexColors: true,
        transparent: true,
        alphaMap: shape
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)


}

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update the camera
    points.rotation.y = elapsedTime*0.3
    bgStars.rotation.y = - elapsedTime*0.05

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()