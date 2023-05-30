import * as THREE from 'three'
const Child = require('./Child').default;
const Vector = require('./Vector').default;
const theta = 0.5

export default class Octree {

    constructor(objects, drawOutline, scene) {

        let biggest = Math.max(Math.abs(objects[0].getPos()[0]), Math.max(Math.abs(objects[0].getPos()[1]), Math.abs(objects[0].getPos()[2])))
        for (let obj of objects) {
            let number = Math.max(Math.abs(obj.getPos()[0]), Math.abs(Math.max(obj.getPos()[1]), Math.abs(obj.getPos()[2])))
            if (biggest < number ){
                biggest = number
            }
        }

        
        this.min = new THREE.Vector3(-biggest, -biggest, -biggest);
        this.max = new THREE.Vector3(biggest, biggest, biggest);

        this.sideLength = this.max.clone().sub(this.min).x
        //construct tree
        this.tree = new Child(new Vector(0, 0, 0), this.sideLength, objects, drawOutline, scene)

    }
    computeForces(object, quads){
        let netForce = new Vector(0, 0, 0);
        for (let quad of quads){
            if (quad.getObjCount() != 0) {
                if ((quad.getObjCount() == 1 && !quad.getObjects()[0].equals(object)) || quad.getSideLength()/this.distance(object.getPos(), quad.getCenterOfMass()) < theta) {

                    netForce.add(object.calculateGravityAndElectroStatic(quad.getCenterOfMass(), quad.getTotalMass()))
                    // netForce.add(object.calculateElectrostatic(quad.getCenterOfMass(), quad.getTotalMass()))


                } else if (quad.getObjCount() > 1){
                    netForce.add(this.computeForces(object, quad.getQuads()))
                }
            }
        }
        return netForce;
    }
    collisionDet(objects, quads){
        let netForce = new Vector(0, 0, 0);
        for (let quad of quads){
            if (quad.getObjCount() != 0) {
                if ((quad.getObjCount() == 1 && !quad.getObjects()[0].equals(object)) || quad.getSideLength()/this.distance(object.getPos(), quad.getCenterOfMass()) < theta) {

                    netForce.add(object.calculateGravityAndElectroStatic(quad.getCenterOfMass(), quad.getTotalMass()))
                    // netForce.add(object.calculateElectrostatic(quad.getCenterOfMass(), quad.getTotalMass()))


                } else if (quad.getObjCount() > 1){
                    netForce.add(this.computeForces(object, quad.getQuads()))
                }
            }
        }
        return netForce;
    }


    getQuads(){
        return this.tree.getQuads()
    }

    distance(arr1, arr2){
        return Math.sqrt( (arr2[0] - arr1[0])**2 + (arr2[1] - arr1[1])**2 + (arr2[2] - arr1[2])**2 )

    }



}