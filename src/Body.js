import * as THREE from 'three'
const Vector = require('./Vector').default;
const Constants = require('./Constants').default
export default class Body {
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
    this.points = [];

    this.density = mass / (Math.PI * Math.pow(radius, 2));
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 32, 32), 
      new THREE.MeshStandardMaterial({roughness: 0, metalness: 0.9})
    );



    this.id = this.sphere.id;
    this.sphere.position.set(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp());
    this.points.push(new THREE.Vector3(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()));
    this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    this.material = new THREE.LineBasicMaterial({ color: 0xff00ff });
    this.line = new THREE.Line(this.geometry, this.material);
    this.scene = scene
    this.scene.add(this.sphere);
    // scene.add(this.line);
    // this.path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3([new THREE.Vector3(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()),]).getPoints()), new THREE.LineBasicMaterial({ color: 0xff0000 }));
    // scene.add(this.path)
  }

  update() {
    let netAcceleration = new Vector(0, 0, 0);
    for (let vector of this.acceleration) {
      netAcceleration.add(vector);
    }

    this.velocity.add(netAcceleration);
    // this.velocity = new Vector(this.velocity.getXComp()*0.9,this.velocity.getZComp()*0.9,this.velocity.getZComp()*0.9)
    // this.velocity.mult(deltaTime)
    this.pos.add(this.velocity);
    

    // if (this.points.length > 100) {
    //   this.points.splice(0, 1);
    // }
    // this.points.push(new THREE.Vector3(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()));

    // // this might stop memory leaks
    // this.line.geometry.dispose();
    // this.line.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
  } 
  
  calculateGravityAndElectroStatic(point, mass){

    let distanceSquared = (point[0] - this.pos.getXComp())**2 + (point[1] - this.pos.getYComp())**2 + (point[2] - this.pos.getZComp())**2 
    let distance = Math.sqrt(distanceSquared)*Constants.distanceScale
    if (distance > (this.radius*2)*Constants.distanceScale){
      let gravityMag = (Constants.G*mass)/distance**2
      let electroStaticMag = (Constants.KTimesProtonChargeSquared)/distance**2
      let xComp = point[0] - this.pos.getXComp()
      let yComp = point[1] - this.pos.getYComp()
      let zComp = point[2] - this.pos.getZComp()
      let gravityScale = gravityMag/distance
      let electroStaticScale = (electroStaticMag/distance)*0
      return new Vector(xComp*gravityScale - xComp*electroStaticScale, yComp*gravityScale - yComp*electroStaticScale, zComp*gravityScale - zComp*electroStaticScale)
    }
    return(new Vector(0,0,0))

        
  }
 

  equals(b) {
    return this === b;
  }

  getDistanceTo(b) {
    let thisPos = this.getPos();
    let thatPos = b.getPos();
    return Math.sqrt(
      Math.pow(thisPos[0] - thatPos[0], 2) 
      + Math.pow(thisPos[1] - thatPos[1], 2) 
      + Math.pow(thisPos[2] - thatPos[2], 2)
    );
  }

  getPos() {
    return [this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()];
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
  addAccelerationAtNextIndex(v) {
    this.acceleration[this.acceleration.length] = v
  }
  addAccelerationAtIndex(index, v) {
    if (index > this.acceleration.length) {
      return;
    }
    this.acceleration[index].add(v);
  }
  clearAccelerationAtIndex(index) {
    if (index > this.acceleration.length) {
      return;
    }
    this.acceleration[index] = new Vector(0, 0, 0)
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
  draw() {
    this.sphere.position.set(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp());
  }
  getRenderObject() {
    return this.sphere
  }
  getId() {
    return this.id
  }
  

}
