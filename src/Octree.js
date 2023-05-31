import * as THREE from 'three'
const Child = require('./Child').default;
const Vector = require('./Vector').default;
const Body = require('./Body').default;
const theta = 0.5

export default class Octree {

    constructor(objects, drawOutline, scene, script) {
        this.script = script
        let biggest = Math.max(Math.abs(objects[0].getPos()[0]), Math.max(Math.abs(objects[0].getPos()[1]), Math.abs(objects[0].getPos()[2])))
        for (let obj of objects) {
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

        this.collision = false;

    }
    computeForces(object, quads){
        let netForce = new Vector(0, 0, 0);
        for (let quad of quads){
            if (quad.getObjCount() != 0) {
                if (quad.getObjCount() == 1) {
                    this.collision = false
                    this.collisionDet(quad.getObjects()[0],quad);
                    if (this.collision){
                        quad.clear()
                        this.collision = false
                    }
                    
                    //changed to and (i dont know how logic works)
                    if (!this.collision && !quad.getObjects()[0].equals(object) && quad.getSideLength()/this.distance(object.getPos(), quad.getCenterOfMass()) < theta) {
                        netForce.add(object.calculateGravityAndElectroStatic(quad.getCenterOfMass(), quad.getTotalMass()))
                        // netForce.add(object.calculateElectrostatic(quad.getCenterOfMass(), quad.getTotalMass()))
                    }

                } else if (quad.getObjCount() > 1){
                    netForce.add(this.computeForces(object, quad.getQuads()))
                }
            }
        }
        return netForce;
    }
    collisionDet(object, quad){
        //check if sidelength is bigger than radius
        // if it is go out a level
        // if not pass the current quad level into another fucntion that checks for collision
        if (object.getRadius()*2 > quad.getSideLength()){
            this.collisionDet(object, quad.getParent())
        }else{
            this.collisionDetReq(object, quad.getParent())
        }
    }
    collisionDetReq(object, quad){
        for (let neibour of quad.getQuads()){
            if (neibour.getObjCount() > 1){
                this.collisionDetReq(object, quad)
            }else if (neibour.getObjCount() == 1 && !neibour.getObjects()[0].equals(object) && neibour.getObjects()[0].getDistanceTo(object) < object.getRadius() + neibour.getObjects()[0].getRadius()){
                this.collision = true;
                let object2 = neibour.getObjects()[0];
                let pos = object.getPos()
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
                let newRadius = Math.cbrt(Math.pow(object.getRadius(),3)+Math.pow(object2.getRadius(),3));

                let renderOne = object.getId()
                let renderTwo = object2.getId()
                let index = this.scene.children.findIndex(obj => obj.id==renderOne);
                this.scene.children.splice(index, 1);
                index = this.scene.children.findIndex(obj => obj.id==renderTwo);
                this.scene.children.splice(index, 1);
                
                this.script.rmObject(object)
                
                this.script.rmObject(object2)
                neibour.clear()

                this.script.addObject(new Body(new Vector(pos[0],pos[1],pos[2]), new Vector(vx, vy, vz), [new Vector(0,0,0)], massSum, newRadius, this.scene))

            }
        }
    }



    getQuads(){
        return this.tree.getQuads()
    }

    distance(arr1, arr2){
        return Math.sqrt( (arr2[0] - arr1[0])**2 + (arr2[1] - arr1[1])**2 + (arr2[2] - arr1[2])**2 )

    }



}