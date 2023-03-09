class Vector {
    constructor(mag, dir) {
      this.mag = mag;
      this.dir = dir;
      this.xComp = mag * Math.cos(dir)
      this.yComp = mag * Math.sin(dir)
    }
  
    add(that) {
      this.xComp = this.xComp + that.xComp;
      this.yComp = this.yComp + that.yComp;
    // const xComp = this.mag * Math.cos(this.dir) + that.getMag() * Math.cos(that.getDir());
    // const yComp = this.mag * Math.sin(this.dir) + that.getMag() * Math.sin(that.getDir());
  
      this.mag = Math.sqrt(Math.pow(this.xComp, 2) + Math.pow(this.yComp, 2));
      this.dir = Math.atan2(this.yComp, this.xComp);
      return this
    }
  
    getMag() {
      return this.mag;

    }
  
    setMag(mag) {
        this.xComp = this.mag * Math.cos(this.dir)
        this.yComp = this.mag * Math.sin(this.dir)
      this.mag = mag;
    }
  
    getDir() {
      return this.dir;
    }
  
    setDir(dir) {
        this.xComp = this.mag * Math.cos(dir)
        this.yComp = this.mag * Math.sin(dir)
      this.dir = dir;
    }
}

class Body {
    constructor(pos, velocity, acceleration, mass, radius, terminalVelocity) {
      this.pos = pos;
      this.velocity = velocity;
      this.acceleration = acceleration;
      this.mass = mass;
      this.radius = radius;
      this.terminalVelocity = terminalVelocity;
    }
  
    update() {
      let netAcceleration = new Vector(0, 0);
      for (let vector of this.acceleration) {
        netAcceleration.add(vector);
      }
      this.velocity.add(netAcceleration);
  
      this.pos[0] += Math.min(this.velocity.getMag(), this.terminalVelocity) * Math.cos(this.velocity.getDir());
      this.pos[1] += Math.min(this.velocity.getMag(), this.terminalVelocity) * Math.sin(this.velocity.getDir());
    }
  
    equals(b) {
      return this === b;
    }
  
    getDistanceTo(b) {
      return Math.sqrt(Math.pow(this.pos[0] - b.getPos()[0], 2) + Math.pow(this.pos[1] - b.getPos()[1], 2));
    }
  
    getPos() {
      return this.pos;
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
      this.acceleration[index] = new Vector(0,0)
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











}

const G = 10
let canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
long = window.innerWidth;
tall = window.innerHeight;
canvasPosX = 0;
canvasPosY = 0

let objects = []
const ctx = canvas.getContext('2d')
ctx.translate(long/2, tall/2)
let running = true

//Listener code was stolen https://stackoverflow.com/questions/4416505/how-to-take-keyboard-input-in-javascript
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
  }
  switch (event.key) {
    case "s":
      running = true;
      break;
    case "ArrowLeft":
      ctx.translate(canvasPosX+10, canvasPosY)
    case "ArrowRight":
      ctx.translate(canvasPosX-10, canvasPosY)
    case "ArrowUp":
      ctx.translate(canvasPosX, canvasPosY-10)
    case "ArrowDown":
      ctx.translate(canvasPosX, canvasPosY+10)



    default:
      return; 
  }
  event.preventDefault();
}, true);
setup()


function setup(){
//   objects.push(new Body([100,100], new Vector(0.3, 0),[new Vector(0,0)], 10,9,500));

//   objects.push(new Body([100,-100], new Vector(0.3, Math.PI),[new Vector(0,0)], 10,9,500));

  let amount = 100; 
  let angleInc = (Math.PI * 2) / amount;
  let angle = 0;
  let radius = 200;
  for (let i = 0; i < amount; i++) {
      objects.push(new Body([radius  * Math.cos(angle), radius  * Math.sin(angle)], new Vector(1 , angle - Math.PI/2),[new Vector(0,0)], 10,9,500));
      
      angle += angleInc;
  }


  amount = 1000; 
  angleInc = (Math.PI * 2) / amount;
  angle = 0;
  radius=400; 
  for (let i = 0; i < amount; i++) {
      objects.push(new Body([radius  * Math.cos(angle), radius  * Math.sin(angle)], new Vector(0.7 , angle +  Math.PI/2), [new Vector(0,0)] , 10,9,500));
      
      angle += angleInc;
  }


}

function drawCircle(x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    
}



// function pulleyForce(){
//   for (object of objects) {
//     netAcceleration = new Vector(0, 0);
//     for (object2 of objects) {
//       if (!object.equals(object2)){
//         netAcceleration.add(new Vector((G*object.getMass())/Math.pow(object.getDistanceTo(object2), 2),Math.atan2(object2.getPos()[1]-object.getPos()[1], object2.getPos()[0]-object.getPos()[0])));
//       }
//     }
//     object.setAccelerationAtIndex(0, netAcceleration);
//   }

// }
function pulleyForce(){
  let stack = [...objects]
  for (object of stack){
    object.clearAccelerationAtIndex(0)
  }
  while(stack.length>1){
    object = stack[0]
    for (object2 of stack){
      if (!object.equals(object2)){
        let distanceSquared = Math.pow(object.getDistanceTo(object2), 2)
        object.addAccelerationAtIndex(0,new Vector((G*object.getMass())/distanceSquared,Math.atan2(object2.getPos()[1]-object.getPos()[1], object2.getPos()[0]-object.getPos()[0])));
        object2.addAccelerationAtIndex(0,new Vector((G*object2.getMass())/distanceSquared,Math.atan2(object.getPos()[1]-object2.getPos()[1], object.getPos()[0]-object2.getPos()[0])))
      }
    }
    stack.splice(0,1)
  }

}

function updateObjects(){
  for(object of objects){
    object.update()
    let pos = object.getPos()
    drawCircle(pos[0], pos[1], object.getRadius())
  }
}

function main(){
  
  if (running){
    ctx.clearRect(-long/2, -tall/2, long, tall);
    pulleyForce()
    updateObjects()
    end = new Date()



  }   

}

setInterval(main, 0)
  