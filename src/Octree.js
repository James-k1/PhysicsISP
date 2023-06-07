import * as THREE from 'three'
const Child = require('./Child').default;
const Vector = require('./Vector').default;
const Body = require('./Body').default;
const Constants = require('./Constants').default;

export default class Octree {
    /**
     * 
     * @param {*} objects Objects array from the main loop
     * @param {*} drawOutline Boolean value determining if the octree is drawn
     * @param {*} scene Scene object from main loop
     */
    constructor(objects, drawOutline, scene) {
        this.charge = 0
        let biggest = Math.max(Math.abs(objects[0].getPos()[0]), Math.max(Math.abs(objects[0].getPos()[1]), Math.abs(objects[0].getPos()[2])))
        for (let obj of objects) {
            this.charge += obj.getCharge()
            let number = Math.max(Math.abs(obj.getPos()[0]), Math.abs(Math.max(obj.getPos()[1]), Math.abs(obj.getPos()[2])))
            if (biggest < number ){
                biggest = number
            }
        }
        this.scene = scene
        
        this.min = new THREE.Vector3(-biggest, -biggest, -biggest);
        this.max = new THREE.Vector3(biggest, biggest, biggest);

        this.sideLength = this.max.clone().sub(this.min).x
        //construct tree
        this.tree = new Child(new Vector(0, 0, 0), this.sideLength, objects, drawOutline, this, scene)

    }

    /**
     * 
     * @param {*} object The object to compute the net for on
     * @param {*} quads An array of the quadrants to search through
     * @returns 
     */
    computeForces(object, quads){
        let netForce = new Vector(0, 0, 0);
        for (let quad of quads){
            if (quad.getObjCount() != 0) {
                if ((quad.getObjCount() == 1 && !quad.getObjects()[0].equals(object)) || quad.getSideLength()/this.distance(object.getPos(), quad.getCenterOfMass()) < Constants.theta) {

                    netForce.add(object.calculateGravityAndElectroStatic(quad.getCenterOfMass(), quad.getCharge(), quad.getTotalMass()))
                    

                } else if (quad.getObjCount() > 1){
                    netForce.add(this.computeForces(object, quad.getQuads()))
                }
            }
        }
        return netForce;
    }
    
    /**
     * Gives an array of collision pairs formated like so: [[thisObject, objectOneThatCollides], [thisObject, objectTwoThatCollides]...]
     * @param {*} object The obejct to find collision pairs for
     * @returns Array
     */
    collisionDet(object){
       
        let godNode = object.getQuad()
        let sideLength = godNode.getSideLength()
        let collisionPairs = []
        while (object.getRadius() > sideLength/2){ //This could be broken into components for more accuracy however this is a good apporximation that provide a good speed boost 
            godNode = godNode.getParent()
            sideLength += godNode.getSideLength()
        }
        let objects = godNode.getObjects()
        for (let obj of objects){
            if (!obj.equals(object) && obj.getDistanceTo(object) < obj.getRadius() + object.getRadius()){
                collisionPairs.push([object, obj])
            }
        }
        return collisionPairs
            
    }
    /**
     * Give 8 quadrants
     * @returns Array
     */
    getQuads(){
        return this.tree.getQuads()
    }
    /**
     * 
     * @param {*} arr1 Position array1  
     * @param {*} arr2 Position array2
     * @returns Double
     */
    distance(arr1, arr2){
        return Math.sqrt( (arr2[0] - arr1[0])**2 + (arr2[1] - arr1[1])**2 + (arr2[2] - arr1[2])**2 )

    }



}