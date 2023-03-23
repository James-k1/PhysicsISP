class Vector {
    constructor(xComp, yComp, zComp) {
      this.xComp = xComp
      this.yComp = yComp
      this.zComp = zComp
    }
  
    add(v) {
      this.xComp+=v.getXComp()
      this.yComp+=v.getYComp()
      this.zComp+=v.getZComp()
    }
    getXComp(){
        return this.xComp
    }
    getYComp(){
        return this.yComp
    }
    getZComp(){
        return this.zComp
    }
    setXComp(x){
        this.xComp=x
    }
    setYComp(y){
        this.yComp=y
    }
    setZComp(z){
        this.zComp=z
    }

}

class Body {
    //pos is a vector
    //velocity is a vector 
    //acceleration is an array of vectors 
    //velocity can be an array of vectors but so far there has been no need
    constructor(pos, velocity, acceleration, mass, radius, scene) {
        this.pos = pos;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.mass = mass;
        this.radius = radius;
        this.density = mass/(Math.PI*Math.pow(radius,2))
        this.sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), new THREE.MeshPhongMaterial({color: 0xffffff}));
        this.sphere.position.set(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp());
        scene.add(this.sphere);
        this.id=this.sphere.id
        this.points = [];
        this.points.push( new THREE.Vector3( this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp() ) );
        this.geometry = new THREE.BufferGeometry().setFromPoints( this.points );
        this.material = new THREE.LineBasicMaterial({ color: 0xff00ff });
        this.line = new THREE.Line( this.geometry, this.material );
        // scene.add( this.line );
        // this.path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3([new THREE.Vector3(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()),]).getPoints()), new THREE.LineBasicMaterial({ color: 0xff0000 }));
        // scene.add(this.path)
      }

    update() {
      let netAcceleration = new Vector(0, 0, 0);
      for (let vector of this.acceleration) {
        netAcceleration.add(vector);
      }
      this.velocity.add(netAcceleration);
  
      this.pos.add(this.velocity)

      // this.points.push(new THREE.Vector3( this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp() ))
      // this.line.geometry = new THREE.BufferGeometry().setFromPoints( this.points );
 

    }
  
    equals(b) {
      return this === b;
    }
  
    getDistanceTo(b) {
      let thisPos = this.getPos()
      let thatPos = b.getPos()
      return Math.sqrt(Math.pow(thisPos[0] - thatPos[0], 2) + Math.pow(thisPos[1] - thatPos[1], 2) + Math.pow(thisPos[2] - thatPos[2], 2));
    }
  
    getPos() {
      return [this.pos.getXComp(),this.pos.getYComp(), this.pos.getZComp()];
    }
  
    setPos(pos) {
      this.pos = pos;
    }
  
    getVelocity() {
      return this.velocity;
    }
  
    setVelocity(velocity) {
      this.velocity = velocity;
    }
  
    getAcceleration() {
      let netAcceleration = new Vector(0, 0);
      for (let vector of this.acceleration) {
        netAcceleration.add(vector);
      }
      return netAcceleration;
    }
  
    setAcceleration(acceleration) {
      this.acceleration = acceleration;
    }
  
    setAccelerationAtIndex(index, v) {
      if (index > this.acceleration.length) {
        return;
      }
      this.acceleration[index] = v;
    }
    addAccelerationAtNextIndex(v){
      this.acceleration[this.acceleration.length]=v
    }
    addAccelerationAtIndex(index, v){
      if (index > this.acceleration.length) {
        return;
      }
      this.acceleration[index].add(v);
    }
    clearAccelerationAtIndex(index){
      if (index > this.acceleration.length) {
        return;
      }
      this.acceleration[index] = new Vector(0,0,0)
    }
  
    getMass() {
      return this.mass;
    }
  
    setMass(mass) {
      this.mass = mass;
    }
  
    getRadius() {
      return this.radius;
    }
  
    setRadius(radius) {
      this.radius = radius;
    }
    draw(){
        this.sphere.position.set(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp());
    }
    getRenderObject(){
      return this.sphere
    }
    getId(){
      return this.id
    }

}


let scene = new THREE.Scene();
let frameCount = 0;
let frameDelay = 10;
let camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 200;
let al = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(al)
let pl = new THREE.PointLight(0xff0000, 5);
scene.add(pl)
let helper = new THREE.PointLightHelper(pl)
scene.add(helper)



let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const G = 10
let delay = 0
let objects = []
let running = true

let lastTime = 0
window.addEventListener('wheel', function(event) {
  let currTime = event.timeStamp
  
  vel = 1/(currTime-lastTime)*100
  if (event.deltaY > 0) {
    camera.position.z += Math.max(vel,1);
  } else if (event.deltaY < 0) {
    camera.position.z -= Math.max(vel,1);
  }
  lastTime=currTime

});





setup()
main()

function setup(){
  // objects.push(new Body(new Vector(-100,-100,100), new Vector(0, 1, 0),[new Vector(0,0,0)], 100,10,scene));
  // objects.push(new Body(new Vector(100,100,-100), new Vector(0, -1, 0),[new Vector(0,0,0)], 100,10,scene));
  // objects.push(new Body(new Vector(500,0), new Vector(0, 0),[new Vector(0,0)], 10,9));
  for (let i = 0; i < 1000 ; i++) {
      objects.push(new Body(new Vector(-200 + Math.random()*400, -200 + Math.random()*400, -200 + Math.random()*400), new Vector(0,0,0),[new Vector(0,0,0)], 1, 9, scene));
  }
  // inner circle
  // let amount = 1000; 
  // let angleInc = (Math.PI * 2) / amount;
  // let angle = 0;
  // let radius = 1000;
  // for (let i = 0; i < amount; i++) {
  //     objects.push(new Body(new Vector(radius  * Math.cos(angle), radius  * Math.sin(angle)), new Vector(Math.cos(angle - Math.PI/2), Math.sin(angle - Math.PI/2)),[new Vector(0,0)], 10,9));
      
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


function pulleyForce(){
  let stack = [...objects]
  for (object of stack){
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
  let newObjects = [...objects]
  while(stack.length>1){
    object = stack[0]
    for (object2 of stack){
      if (!object.equals(object2) && object.getDistanceTo(object2) <= object.getRadius() + object2.getRadius()){

        //im very sure i did some bad math here
        let newRadius = Math.cbrt(Math.pow(object.getRadius(),3)+Math.pow(object2.getRadius(),3));
        console.log(newRadius)
        let pos = object.getPos()
        let pos2 = object2.getPos()
        let massOne = object.getMass()
        let massTwo = object2.getMass()
        let massSum = massOne+massTwo
        let velOne = object.getVelocity()
        let velTwo = object2.getVelocity()
        let vx = 0*(massOne * velOne.getXComp() + massTwo * velTwo.getXComp())/(massSum)
        let vy = 0*(massOne * velOne.getYComp() + massTwo * velTwo.getYComp())/(massSum)
        let vz = 0*(massOne * velOne.getZComp() + massTwo * velTwo.getZComp())/(massSum)
        newObjects.push(new Body(new Vector((pos[0]+pos2[0])/2,(pos[1]+pos2[1])/2,(pos[2]+pos2[2])/2), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, newRadius, scene))

        let renderOne = object.getId()
        let renderTwo = object2.getId()
        let index = scene.children.findIndex(obj => obj.id==renderOne);
        scene.children.splice(index, 1);
        index = scene.children.findIndex(obj => obj.id==renderTwo);
        scene.children.splice(index, 1);

        index = newObjects.findIndex(obj => obj.equals(object));
        newObjects.splice(index, 1);
        index = newObjects.findIndex(obj => obj.equals(object2));
        newObjects.splice(index, 1);


      }
    }
    stack.splice(0,1)
  }
  objects = newObjects
}

function updateObjects(){
  for(object of objects){
    object.update()
    object.draw()
    
  }
}

function main(){
  frameCount++
  if (running && (frameDelay==0 || frameCount%frameDelay==0)){
    pulleyForce()
    collisionDetection()
    updateObjects()
    
  
    // let highestMass = -1;
    // let objectWithHighestMass = null;

    // for (let i = 0; i < objects.length; i++) {
    //   if (objects[i].getMass() > highestMass) {
    //     highestMass = objects[i].id;
    //     objectWithHighestMass = objects[i];
    //   }
    // }
    // let pos = objectWithHighestMass.getPos()
    // camera.position.x = pos[0]
    // camera.position.y = pos[1]
    // camera.position.z = pos[2]+50
    renderer.render(scene, camera);



  }   
  requestAnimationFrame(main);

}


