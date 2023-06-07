import * as THREE from 'three'
const Vector = require('./Vector').default;
const Constants = require('./Constants').default
export default class Body {
  /**
   * 
   * @param {*} pos Vector of initial position
   * @param {*} velocity Vector of initial velocity
   * @param {*} acceleration Vector of initial acceleration
   * @param {*} mass mass in kg
   * @param {*} charge net charge of object
   * @param {*} radius size of the object
   * @param {*} scene the scene from the main loop
   */
  constructor(pos, velocity, acceleration, mass, charge, radius, scene) {
    this.pos = pos;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.mass = mass;
    this.radius = radius;
    this.points = [];
    this.quad = null
    this.alive = true
    this.charge = charge
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

  }

  /**
   * Updates positions and velocites
   */
  update() {
    let netAcceleration = new Vector(0, 0, 0);
      for (let vector of this.acceleration) {
        netAcceleration.add(vector);
    }

    this.velocity.add(netAcceleration);

    this.pos.add(this.velocity);

  } 
  /**
   * return the acceleration Vector of the force of gravity and electrostatic repulsion 
   * @param {*} point The point of another object or the center of mass of a collection of objects
   * @param {*} charge Net charge of object(s)
   * @param {*} mass Total mass of object(s)
   * @returns Vector
   */
  calculateGravityAndElectroStatic(point, charge, mass){

    let distanceSquared = (point[0] - this.pos.getXComp())**2 + (point[1] - this.pos.getYComp())**2 + (point[2] - this.pos.getZComp())**2 
    let distance = Math.sqrt(distanceSquared)*Constants.distanceScale
    if (distance > (this.radius*2)*Constants.distanceScale){
      let gravityMag = (Constants.G*mass)/distance**2
      let electroStaticMag = (Constants.k * this.charge * charge)/distance**2
      let xComp = point[0] - this.pos.getXComp()
      let yComp = point[1] - this.pos.getYComp()
      let zComp = point[2] - this.pos.getZComp()
      let gravityScale = gravityMag/distance
      let electroStaticScale = (electroStaticMag/distance)
      return new Vector(xComp*gravityScale - xComp*electroStaticScale, yComp*gravityScale - yComp*electroStaticScale, zComp*gravityScale - zComp*electroStaticScale)
    }
    return(new Vector(0,0,0))

        
  }
 
  /**
   * 
   * @param {*} b An object 
   * @returns Boolean
   */
  equals(b) {
    return this === b;
  }

  /**
   * 
   * @param {*} b an Object
   * @returns Double
   */
  getDistanceTo(b) {
    let thisPos = this.getPos();
    let thatPos = b.getPos();
    return Math.sqrt(
      Math.pow(thisPos[0] - thatPos[0], 2) 
      + Math.pow(thisPos[1] - thatPos[1], 2) 
      + Math.pow(thisPos[2] - thatPos[2], 2)
    );
  }
  /**
   * 
   * @returns Array
   */
  getPos() {
    return [this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp()];
  }
  /**
   * 
   * @param {*} pos New position as a vector
   */
  setPos(pos) {
    this.pos = pos;
  }

  /**
   * 
   * @returns Vector
   */
  getVelocity() {
    return this.velocity;
  }
  /**
   * 
   * @param {*} velocity New velocity for this object
   */
  setVelocity(velocity) {
    this.velocity = velocity;
  }

  /**
   * 
   * @returns Vector
   */
  getAcceleration() {
    let netAcceleration = new Vector(0, 0);
    for (let vector of this.acceleration) {
      netAcceleration.add(vector);
    }
    return netAcceleration;
  }
  /**
   * 
   * @param {*} acceleration New net acceleration for this object
   */
  setAcceleration(acceleration) {
    this.acceleration = acceleration;
  }
  /**
   * 
   * @param {*} index Position in net acceleration array to insert acceleration
   * @param {*} v Acceleration vector
   */
  setAccelerationAtIndex(index, v) {
    if (index > this.acceleration.length) {
      return;
    }
    this.acceleration[index] = v;
  }
    /**
   * 
   * @param {*} v Acceleration vector
   */
  addAccelerationAtNextIndex(v) {
    this.acceleration[this.acceleration.length] = v
  }
    /**
   * 
   * @param {*} index Position in net acceleration array to add acceleration
   * @param {*} v Acceleration vector
   */
  addAccelerationAtIndex(index, v) {
    if (index > this.acceleration.length) {
      return;
    }
    this.acceleration[index].add(v);
  }
    /**
   * 
   * @param {*} index Position in net acceleration array to clear acceleration
   */
  clearAccelerationAtIndex(index) {
    if (index > this.acceleration.length) {
      return;
    }
    this.acceleration[index] = new Vector(0, 0, 0)
  }
  /**
   * 
   * @returns Double
   */
  getMass() {
    return this.mass;
  }
  /**
   * 
   * @param {*} mass New mass of this object
   */
  setMass(mass) {
    this.mass = mass;
  }
  /**
   * 
   * @returns Double
   */
  getRadius() {
    return this.radius;
  }
  /**
   * 
   * @param {*} radius New radius for this object
   */
  setRadius(radius) {
    this.radius = radius;
  }
  /**
   * Updated the position of the sphear in the scene based on this objects position
   */
  draw() {
    this.sphere.position.set(this.pos.getXComp(), this.pos.getYComp(), this.pos.getZComp());
  }
  /**
   * 
   * @returns THREE.Mesh
   */
  getRenderObject() {
    return this.sphere
  }
  /**
   * 
   * @returns String
   */
  getId() {
    return this.id
  }
  /**
   * 
   * @param {*} quad The quadrent this object is in within the octree
   */
  setQuad(quad){
    this.quad = quad
  }
  /**
   * 
   * @returns Child
   */
  getQuad(){
    return this.quad
  }
  /**
   * If this.alive is false, that mean this objecy has been used in a collision and should not be used in other collision or for other application
   */
  kill(){
    this.alive = false
  }
  /**
   * 
   * @returns Boolean
   */
  isAlive(){
    return this.alive
  }
  /**
   * 
   * @returns Number
   */
  getCharge(){
    return this.charge
  }


}
