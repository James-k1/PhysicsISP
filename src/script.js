import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import * as dat from 'dat.gui'
import { PointLightHelper } from 'three';
const Vector = require('./Vector').default;
const Body = require('./Body').default;
const Constants = require('./Constants').default;
const Octree = require('./Octree').default
let inputs = {
  numberOfObjects: 20,
  maxDist: 800,
  protonIntensity: 0,
  electronIntensity: 0,
};
let oldInputs = {
  numberOfObjects: 20,
  protonIntensity: 0,
  electronIntensity: 0,
}


const gui = new dat.GUI()
gui.add(inputs, "numberOfObjects", 0, 2000).name("Objects")
gui.add(inputs, "maxDist").name("Distance")
gui.add(inputs, "protonIntensity").name("Proton Intensity")
gui.add(inputs, "electronIntensity").name("Electron Intensity")

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Lights
const pointLight = new THREE.PointLight(0x0000ff, 10)
pointLight.position.x = 0
pointLight.position.y = 0
pointLight.position.z = 0
const ambientLight = new THREE.AmbientLight(0xffcc6f , 10)
// scene.add(pointLight)
scene.add(ambientLight)

/**
 * helper
 */
// scene.add(new PointLightHelper(pointLight))

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
    console.log(sizes.width)
    console.log(sizes.height)

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


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 200
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// const controls = new FirstPersonControls(camera, canvas)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Simulation
 */
let objects = [];
setup()

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{ 
  let objectDelta = inputs.numberOfObjects - oldInputs.numberOfObjects
  if (objectDelta > 0){
    addObjects(objectDelta)

  }else if (objectDelta < 0){
    rmObjects(objects.slice(objectDelta))
    objects = objects.slice(0, objectDelta)
    
  }
  oldInputs.numberOfObjects = inputs.numberOfObjects


  collisionDetection()  
  updateObjects()
    
    //create Tree
    if (objects.length > 1){
      let tree = new Octree(objects, false, scene)

      //draw box
      const boxMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xff0000});
      const geometry = new THREE.BoxGeometry(tree.sideLength, tree.sideLength, tree.sideLength);
      const wireframeBox = new THREE.Mesh(geometry, boxMaterial);
      wireframeBox.name = "destroy";
      // scene.add(wireframeBox)

      for (let object of objects){
        object.setAccelerationAtIndex(0, tree.computeForces(object, tree.getQuads()))
        
      }
    }
    
  

    

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    //Remove garbage

    let rmObj = scene.getObjectByName("destroy")
    while(rmObj != null){
      scene.remove(rmObj);
      rmObj = scene.getObjectByName("destroy")
    }

    console.log("frame")

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()

function rmObjects(arr){
  for (let body of arr){
    let index = scene.children.findIndex(obj => obj.id==body.getId());
    scene.children.splice(index, 1);
  }
}

function setup(){
  addObjects(inputs.numberOfObjects)
}

function addObjects(num){

    for (let i = 0; i <  num; i++) {

    let x = -inputs.maxDist + Math.random()*inputs.maxDist*2
    let y = -inputs.maxDist + Math.random()*inputs.maxDist*2
    let z = -inputs.maxDist + Math.random()*inputs.maxDist*2
  

    // let mag = Math.sqrt(x*x + y*y + z*z)
    // let normal = new Vector(--x/mag, --y/mag, --z/mag)
    let normal = new Vector(-50 + Math.random()*100, -50 + Math.random()*100, -50 + Math.random()*100)
    normal.mult(0.25)
  

    objects.push(new Body(new Vector(x,y,z), normal,[new Vector(0,0,0), new Vector(0,0,0)], 1.67e-27, 13, scene));

  }
}


function collisionDetection(){
  let stack = [...objects]
  while(stack.length>1){
    let object = stack[0]
    for (let object2 of stack){
      if (!object.equals(object2) && object.getDistanceTo(object2) <= object.getRadius() + object2.getRadius()){

        //im very sure i did some bad math here
        let newRadius = Math.cbrt(Math.pow(object.getRadius(),3)+Math.pow(object2.getRadius(),3));
        

        let pos = object.getPos()
        let pos2 = object2.getPos()
        let massOne = object.getMass()
        let massTwo = object2.getMass()
        let massSum = massOne+massTwo
        let velOne = object.getVelocity()
        let velTwo = object2.getVelocity()
        let vx = (massOne * velOne.getXComp() + massTwo * velTwo.getXComp())/(massSum)
        let vy = (massOne * velOne.getYComp() + massTwo * velTwo.getYComp())/(massSum)
        let vz = (massOne * velOne.getZComp() + massTwo * velTwo.getZComp())/(massSum)
        if (object.getRadius() > object2.getRadius()){
          pos = object.getPos()
        }else{
          pos = object2.getPos()
        }
        // objects.push(new Body(new Vector((pos[0]+pos2[0])/2,(pos[1]+pos2[1])/2,(pos[2]+pos2[2])/2), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, newRadius, scene))
        objects.push(new Body(new Vector(pos[0],pos[1],pos[2]), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, newRadius, scene))

        let renderOne = object.getId()
        let renderTwo = object2.getId()
        let index = scene.children.findIndex(obj => obj.id==renderOne);
        scene.children.splice(index, 1);
        index = scene.children.findIndex(obj => obj.id==renderTwo);
        scene.children.splice(index, 1);
        // index = scene.children.findIndex(obj => obj.id==object.line.id);
        // scene.children.splice(index, 1);
        // index = scene.children.findIndex(obj => obj.id==object2.line.id);
        // scene.children.splice(index, 1);

        index = objects.findIndex(obj => obj.equals(object));
        objects.splice(index, 1);

        index = objects.findIndex(obj => obj.equals(object2));
        objects.splice(index, 1);

        index = stack.findIndex(obj => obj.equals(object2));
        stack.splice(index, 1);
        break
      }
    }
    stack.splice(0,1)
  }

}

function updateObjects(){
  for(let object of objects){
    object.update()
    object.draw()
    
  }
}




