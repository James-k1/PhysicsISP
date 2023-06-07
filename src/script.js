import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { PointLightHelper } from 'three';
const Vector = require('./Vector').default;
const Body = require('./Body').default;
const Constants = require('./Constants').default;
const Octree = require('./Octree').default
let chartData = {datasets: [ {label: 'Mass', data: [{x: 0, y: 0}]}]}
const chartConfig = {
  type: 'line',
  data: chartData,
  options: {
    scales: {
        y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Mass'
            }
            
        },
        x: {
          
          title: {
            display: true,
            text: 'Time'
          }
          
      },
    
    },

}
};
let time = 1
let graph = new Chart(document.getElementById("graph").getContext("2d"), chartConfig)

graph.update()



let inputs = {
  addObject : false,
  numberOfObjects: 0,
  radius: 1000,
  distance: 50,
  protonIntensity: 60,
  electronIntensity: 60,
  distanceScale: 7,
  theta: 0.5,
  showOctree : false

};





let gui = new dat.GUI()
gui.add(inputs, "addObject").name("Add Objects")
gui.add(inputs, "numberOfObjects").name("Object Count").min(0)

gui.add(inputs, "radius").name("Radius")
gui.add(inputs, "distance").name("Distance")
gui.add(inputs, "protonIntensity").name("Proton Intensity")
gui.add(inputs, "electronIntensity").name("Electron Intensity")
gui.add(inputs, "distanceScale").name("Distance Scale")
gui.add(inputs, "theta",0,1).name("Theta").step(0.01)
gui.add(inputs, "showOctree").name("Show Octree")


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Lights
const pointLight = new THREE.PointLight(0xffffff, 20)
pointLight.position.x = 0
pointLight.position.y = 0
pointLight.position.z = 0
const ambientLight = new THREE.AmbientLight(0xffcc6f , 10)
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
    height: window.innerHeight*0.8
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight*0.8

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
})

let objectPoint = new THREE.Vector3();
//updates plane infront of camera
window.addEventListener('mousemove', (e) => {

  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  direction.x = direction.x * inputs.distance * 100
  direction.y = direction.y * inputs.distance * 100
  direction.z = direction.z * inputs.distance * 100

  objectPoint.x = camera.position.x + direction.x
  objectPoint.y = camera.position.y + direction.y
  objectPoint.z = camera.position.z + direction.z


})
//adds objects on click event
window.addEventListener('click', (e) => {
  if (e.x < 1658 && e.y > 168){
    
    if(inputs.addObject){
      console.log(inputs.protonIntensity)
      console.log(inputs.electronIntensity)
      addObjects(inputs.numberOfObjects, objectPoint.x, objectPoint.y, objectPoint.z, inputs.protonIntensity, inputs.electronIntensity)

    }
  }
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

/**
 * Main Loop
 */
const tick = () => {
  //get inputs
  Constants.distanceScale = Math.pow(10,inputs.distanceScale)
  Constants.theta = Math.pow(10,inputs.theta)

  updateObjects()
    
    //create Tree
    if (objects.length > 1){
      let tree = new Octree(objects, inputs.showOctree, scene)

    //draw box
    const boxMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xff0000});
    const geometry = new THREE.BoxGeometry(tree.sideLength, tree.sideLength, tree.sideLength);
    const wireframeBox = new THREE.Mesh(geometry, boxMaterial);
    wireframeBox.name = "destroy";

    //strong for or collision detection
    let collisions = []
    for (let object of objects){
      let force = tree.computeForces(object, tree.getQuads())
      let objectsCollisions = tree.collisionDet(object, object.getQuad(), object.getQuad().getSideLength())
      collisions = collisions.concat(objectsCollisions)
      if (force){
        object.setAccelerationAtIndex(0, force) 
      }
    }
    //creates new objects based on collision pairs
    for (let collisionPairs of collisions){
      if (collisionPairs[0].isAlive() && collisionPairs[1].isAlive()){
        let newObj = newObjectFromCollision(collisionPairs[0],collisionPairs[1])
        objects.push(newObj)
        removeFromSceneById(collisionPairs[0].getId())
        removeFromSceneById(collisionPairs[1].getId())

        removeFromObjects(collisionPairs[0])
        removeFromObjects(collisionPairs[1])
        
        collisionPairs[0].kill()
        collisionPairs[1].kill()
      }
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

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
  
}
tick()


//adds objects based on predefined inputs
function setup(){
  addObjects(inputs.numberOfObjects, 0, 0, 0, inputs.protonIntensity, inputs.electronIntensity)
}

/**
 * 
 * @param {*} num number of objects 
 * @param {*} ox X position
 * @param {*} oy Y position
 * @param {*} oz Z position
 * @param {*} pi Proton intensity
 * @param {*} ei Electron intensity
 */
function addObjects(num, ox, oy, oz, pi, ei){

    for (let i = 0; i <  num; i++) {

    let x = ox - inputs.radius + Math.random()*inputs.radius*2
    let y = oy - inputs.radius + Math.random()*inputs.radius*2
    let z = oz - inputs.radius + Math.random()*inputs.radius*2


    objects.push(new Body(new Vector(x,y,z), new Vector(0,0,0),[new Vector(0,0,0), new Vector(0,0,0)], 1.67e-27*Math.pow(10,pi), Math.pow(10,pi)-Math.pow(10,ei), 13, scene));

  }
}

/**
 * 
 * @param {*} objId Id of object to remove. Id comes from the scene ids.
 */
function removeFromSceneById(objId){
  let index = scene.children.findIndex(obj => obj.id==objId);
  if (index != -1){
    scene.children.splice(index, 1);
  }
}

/**
 * 
 * @param {*} obj Object in objects array 
 */
function removeFromObjects(obj){
  let index = objects.findIndex(o => o.equals(obj));
  if (index != -1){
    objects.splice(index, 1);
  }

}

/**
 * 
 * @param {*} objOne Object that collides with objTwo
 * @param {*} objTwo Object that collides with objOne
 * @returns new object that combines traits from objOne and objTwo
 */
function newObjectFromCollision(objOne, objTwo) {
  let newRadius = Math.cbrt(Math.pow(objOne.getRadius(),3)+Math.pow(objTwo.getRadius(),3));

  let pos = objOne.getPos()

  let massOne = objOne.getMass()
  let massTwo = objTwo.getMass()
  let massSum = massOne+massTwo
  let velOne = objOne.getVelocity()
  let velTwo = objTwo.getVelocity()
  let vx = (massOne * velOne.getXComp() + massTwo * velTwo.getXComp())/(massSum)
  let vy = (massOne * velOne.getYComp() + massTwo * velTwo.getYComp())/(massSum)
  let vz = (massOne * velOne.getZComp() + massTwo * velTwo.getZComp())/(massSum)
  if (objOne.getRadius() < objTwo.getRadius()){
    pos = objTwo.getPos()
  }
  // objects.push(new Body(new Vector((pos[0]+pos2[0])/2,(pos[1]+pos2[1])/2,(pos[2]+pos2[2])/2), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, newRadius, scene))
  return new Body(new Vector(pos[0],pos[1],pos[2]), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, Math.pow(10,inputs.protonIntensity)-Math.pow(10,inputs.electronIntensity), newRadius, scene)
}


/**
 * Updates the graph
 */
function updateChart(){
  let max = 0
  for (let obj of objects){
    if (obj.getMass() > max){
      max = obj.getMass()
    }
  }
  graph.data.labels.push(time);
  chartConfig.data.datasets[0].data.push({x: time, y:max})
  console.log(chartConfig.data.datasets[0])
  time++
  graph.update()

}

/**
 * Updated the velocities and positions of objects in the objects array and scene
 */
function updateObjects(){
  for(let object of objects){
    object.update()
    object.draw()
    
  }
}

//Updates the chart every second
setInterval(function() {updateChart();}, 1000); 
