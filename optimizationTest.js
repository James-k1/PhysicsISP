class Vector {
    constructor(xComp, yComp) {
      this.xComp = xComp
      this.yComp = yComp
    }
  
    add(v) {
      this.xComp+=v.getXComp()
      this.yComp+=v.getYComp()
    }
    getXComp(){
        return this.xComp
    }
    getYComp(){
        return this.yComp
    }
    setXComp(x){
        this.xComp=x
    }
    setYComp(y){
        this.yComp=y
    }

}

class Body {
    //pos is a vector
    //velocity is a vector 
    //acceleration is an array of vectors 
    //velocity can be an array of vectors but so far there has been no need
    constructor(pos, velocity, acceleration, mass, radius) {
      this.pos = pos;
      this.velocity = velocity;
      this.acceleration = acceleration;
      this.mass = mass;
      this.radius = radius;
      this.density = mass/(Math.PI*Math.pow(radius,2))
    }

    update() {
      let netAcceleration = new Vector(0, 0);
      for (let vector of this.acceleration) {
        netAcceleration.add(vector);
      }
      this.velocity.add(netAcceleration);
  
      this.pos.add(this.velocity)
    }
  
    equals(b) {
      return this === b;
    }
  
    getDistanceTo(b) {
      return Math.sqrt(Math.pow(this.getPos()[0] - b.getPos()[0], 2) + Math.pow(this.getPos()[1] - b.getPos()[1], 2));
    }
  
    getPos() {
      return [this.pos.getXComp(),this.pos.getYComp()];
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
let long = window.innerWidth;
let tall = window.innerHeight;
let canvasPosX = 0;
let canvasPosY = 0
let delay = 0
let objects = []
const ctx = canvas.getContext('2d')
ctx.translate(long/2, tall/2)
let running = true



// Event listener code was stolen https://stackoverflow.com/questions/4416505/how-to-take-keyboard-input-in-javascript
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
  }
  switch (event.key) {
    case "s":
      running = true;
      break;




    default:
      return; 
  }
  event.preventDefault();
}, true);
setup()


function setup(){
  // objects.push(new Body(new Vector(0,0), new Vector(0, 0),[new Vector(0,0)], 10,9));

  // objects.push(new Body(new Vector(500,0), new Vector(0, 0),[new Vector(0,0)], 10,9));
  for (let i = 0; i < 2 ; i++) {
      objects.push(new Body(new Vector(-200 + Math.random()*400,-200 + Math.random()*400), new Vector(0,0),[new Vector(0,0)], 10,9));
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

function drawCircle(x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    
}

// function pulleyForce(){
//   let stack = [...objects];
//   for (object of stack){
//     object.clearAccelerationAtIndex(0);
//   }
//   while(stack.length>1){
//     object = stack[0];
//     for (object2 of stack){
//       if (!object.equals(object2)){
//         let distanceSquared = Math.pow(object.getDistanceTo(object2), 2);
//         let massTimesG = G * object.getMass();
//         let mass2TimesG = G * object2.getMass();
//         let yDiff = object2.getPos()[1] - object.getPos()[1];
//         let xDiff = object2.getPos()[0] - object.getPos()[0];
//         let invDist = 1.0 / Math.sqrt(distanceSquared);
//         let xComp = xDiff * invDist;
//         let yComp = yDiff * invDist;
//         let mag = massTimesG * invDist * invDist;
//         object.addAccelerationAtIndex(0, new Vector(xComp * mag, yComp * mag));
//         mag = mass2TimesG * invDist * invDist;
//         object2.addAccelerationAtIndex(0, new Vector(-xComp * mag, -yComp * mag));
//       }
//     }
//     stack.splice(0,1);
//   }
// }

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
        // console.log(object.getMass()*object2.getMass()/distanceSquared)
        
        let mag = (G*object.getMass())/distanceSquared
        let yComp = object2Pos[1]-objectPos[1]
        let xComp = object2Pos[0]-objectPos[0]
        let scale = mag/distance
        object.addAccelerationAtIndex(0, new Vector(xComp*scale,yComp*scale))

        mag = (G*object2.getMass())/distanceSquared
        scale = mag/distance
        object2.addAccelerationAtIndex(0, new Vector(-xComp*scale,-yComp*scale))
        
      }
    }
    stack.splice(0,1)
  }
}


function collisionDetection(){
  let stack = [...objects]
  while(stack.length>1){
    object = stack[0]
    for (object2 of stack){
      if (!object.equals(object2) && object.getDistanceTo(object2) <= object.getRadius() + object2.getRadius()){
        

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
    console.time('pulleyForce')
    pulleyForce()
    
    console.timeEnd('pulleyForce');
    updateObjects()
    end = new Date()



  }   

}

setInterval(main, delay)
  



//working optmized

// function pulleyForce(){
//   let stack = [...objects]
//   for (object of stack){
//     object.clearAccelerationAtIndex(0)
//   }
//   while(stack.length>1){
//     let object = stack[0]
//     let objectPos = object.getPos()
//     for (let object2 of stack){
//       if (!object.equals(object2)){
//         let object2Pos = object2.getPos()
//         let distanceSquared = Math.pow(object.getDistanceTo(object2), 2)
//         //i have decided that for this project index 0 will be reserved for the gravitational force
//         let mag = (G*object.getMass())/distanceSquared
//         let yComp = object2Pos[1]-objectPos[1]
//         let xComp = object2Pos[0]-objectPos[0]
//         let scale = mag/Math.sqrt(Math.pow(xComp,2)+Math.pow(yComp,2))
//         object.addAccelerationAtIndex(0, new Vector(xComp*scale,yComp*scale))

//         mag = (G*object2.getMass())/distanceSquared
//         scale = mag/Math.sqrt(Math.pow(xComp,2)+Math.pow(yComp,2))
//         object2.addAccelerationAtIndex(0, new Vector(-xComp*scale,-yComp*scale))
//       }
//     }
//     stack.splice(0,1)
//   }
// }