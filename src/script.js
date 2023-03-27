import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import * as dat from 'dat.gui'
import { PointLightHelper } from 'three';
const Vector = require('./Vector').default;
const Body = require('./Body').default;
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Lights
const pointLight = new THREE.PointLight(0x0000ff, 10)
pointLight.position.x = 0
pointLight.position.y = 0
pointLight.position.z = 0
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(pointLight)
scene.add(ambientLight)

/**
 * helper
 */
scene.add(new PointLightHelper(pointLight))

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2000
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
let G = 10;
setup()

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // console.time("calcGravity")

    
   
    // console.log(pos[0]==300 && pos[1]==0 && pos[2]==0)
    calcGravity()
    collisionDetection()
    updateObjects()
    // let pos = objects[0].getPos()
    // camera.position.x = pos[0]
    // camera.position.y = pos[1]
    // controls.target.set(pos[0],pos[1],pos[2])
    // console.log(pos)
    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()

function setup(){
  // objects.push(new Body(new Vector(6,0,0), new Vector(0, 0, 0),[new Vector(0,0,0),new Vector(-1,0,0)], 100,10,scene));
  // objects.push(new Body(new Vector(100,100,-100), new Vector(0, -1, 0),[new Vector(0,0,0)], 100,10,scene));
  // objects.push(new Body(new Vector(500,0), new Vector(0, 0),[new Vector(0,0)], 10,9));
  for (let i = 0; i < 100 ; i++) {
      objects.push(new Body(new Vector(-400 + Math.random()*800, -400 + Math.random()*800, -400 + Math.random()*800), new Vector(0,0,0),[new Vector(0,0,0)], 1, 13, scene));
  }

  // inner circle
  // let amount = 1000; 
  // let angleInc = (Math.PI * 2) / amount;
  // let angle = 0;
  // let radius = 4000;
  // for (let i = 0; i < amount; i++) {
  //     objects.push(new Body(new Vector(radius  * Math.cos(angle), radius  * Math.sin(angle), 0), new Vector(Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2), 0),[new Vector(0,0)], 50,10, scene));
      
  //     angle += angleInc;
  // }

  //outer circle
  // amount = 10; 
  // angleInc = (Math.PI * 2) / amount;
  // angle = 0;
  // radius=400; 
  // for (let i = 0; i < amount; i++) {
  //     objects.push(new Body([radius  * Math.cos(angle), radius  * Math.sin(angle)], new Vector(0.7 , angle +  Math.PI/2), [new Vector(0,0)] , 10,9));
      
  //     angle += angleInc;
  // }


}

function calcGravity(){
  let stack = [...objects]
  for (let object of stack){
    object.clearAccelerationAtIndex(0)
  }
  while(stack.length>1){
    let object = stack[0]
    let objectPos = object.getPos()
    for (let object2 of stack){
      if (!object.equals(object2)){
        let object2Pos = object2.getPos()
        let distance = object.getDistanceTo(object2)
        let distanceSquared = Math.pow(distance, 2)
        //i have decided that for this project index 0 will be reserved for the gravitational force
        let mag = (G*object2.getMass())/distanceSquared
        let xComp = object2Pos[0]-objectPos[0]
        let yComp = object2Pos[1]-objectPos[1]
        let zComp = object2Pos[2]-objectPos[2]
        let scale = mag/distance
        object.addAccelerationAtIndex(0, new Vector(xComp*scale,yComp*scale,zComp*scale))

        mag = (G*object.getMass())/distanceSquared
        scale = mag/distance
        object2.addAccelerationAtIndex(0, new Vector(-xComp*scale,-yComp*scale,-zComp*scale))
        
      }
    }
    stack.splice(0,1)
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
        index = scene.children.findIndex(obj => obj.id==object.line.id);
        scene.children.splice(index, 1);
        index = scene.children.findIndex(obj => obj.id==object2.line.id);
        scene.children.splice(index, 1);

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




