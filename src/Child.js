import * as THREE from 'three'

const Vector = require('./Vector').default;

export default class Child {
    /**
     * 
     * @param {*} midPoint Vector, middle of the quadrant 
     * @param {*} sideLength Double
     * @param {*} objects Array of the objects in this quadrant. If this is not a leaf node then it contains an array of all the objects below it.
     * @param {*} drawOutline Boolean, to draw or not to draw octree
     * @param {*} parent Child, Parent quad
     * @param {*} scene Scene from main loop
     */
    constructor(midPoint, sideLength, objects, drawOutline, parent, scene) {
        this.midPoint = midPoint;
        this.sideLength=sideLength;
        this.objects=objects;
        this.objCount = objects.length
        this.scene = scene
        this.totalMass = 0; 
        this.parent = parent
        this.charge = 0
        if (this.objCount == 1){
            this.charge = objects[0].getCharge()
            this.objects[0].setQuad(this)
        }
        //calculate center of mass bottom up NOT top down
        this.centerOfMass = [0, 0, 0];

        //subdivide
        let quadOneObj = []
        let quadTwoObj = []
        let quadThreeObj = []
        let quadFourObj = []
        let quadFiveObj = []
        let quadSixObj = []
        let quadSevenObj = []
        let quadEightObj = []

        if (this.objCount > 1){
            let lenDivTwo = this.sideLength/2
            let mx = this.midPoint.getXComp()
            let my = this.midPoint.getYComp()
            let mz = this.midPoint.getZComp()
            if (drawOutline){
                const geometryOne = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx, my + lenDivTwo, mz), new THREE.Vector3(mx, my-lenDivTwo, mz)]);
                const geometryTwo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx + lenDivTwo, my, mz), new THREE.Vector3(mx - lenDivTwo, my, mz)]);
                const geometryThree = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx, my, mz + lenDivTwo), new THREE.Vector3(mx, my, mz - lenDivTwo)]);
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
                const lineOne = new THREE.Line(geometryOne, material);
                const lineTwo = new THREE.Line(geometryTwo, material);
                const lineThree = new THREE.Line(geometryThree, material);

                const boxMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xff0000});
                const geometry = new THREE.BoxGeometry(sideLength, sideLength, sideLength);
                const wireframeBox = new THREE.Mesh(geometry, boxMaterial);
                wireframeBox.position.x = mx
                wireframeBox.position.y = my
                wireframeBox.position.z = mz
                wireframeBox.name = "destroy";
                scene.add(wireframeBox);

                lineOne.name = "destroy";
                lineTwo.name = "destroy";
                lineThree.name = "destroy";
                scene.add(lineOne)
                scene.add(lineTwo)
                scene.add(lineThree)
            }
            for (let obj of objects){
                this.charge += obj.getCharge()
                let x = obj.getPos()[0]
                let y = obj.getPos()[1]
                let z = obj.getPos()[2]
                if (x < mx && y > my && z > mz){
                    quadOneObj[quadOneObj.length]=obj

                }else if (x > mx && y > my && z > mz){
                    quadTwoObj[quadTwoObj.length]=obj

                }else if (x < mx && y < my && z > mz){
                    quadThreeObj[quadThreeObj.length]=obj

                }else if (x > mx && y < my && z > mz){
                    quadFourObj[quadFourObj.length]=obj

                }else if (x < mx && y > my && z < mz){
                    quadFiveObj[quadFiveObj.length]=obj

                }else if (x > mx && y > my && z < mz){
                    quadSixObj[quadSixObj.length]=obj

                }else if (x < mx && y < my && z < mz){
                    quadSevenObj[quadSevenObj.length]=obj

                }else if (x > mx && y < my && z < mz){
                    quadEightObj[quadEightObj.length]=obj

                } else {
                    console.log("An Error Occured and an Object was Lost. If the Simulation is big, there is nothing to worry about.")
                }
            }
            //omg im loosing my mind
            let lenDivFour = lenDivTwo/2;

            this.quads = [new Child(new Vector(mx - lenDivFour, my + lenDivFour, mz + lenDivFour), lenDivTwo, quadOneObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my + lenDivFour, mz + lenDivFour), lenDivTwo, quadTwoObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my - lenDivFour, mz + lenDivFour), lenDivTwo, quadThreeObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my - lenDivFour, mz + lenDivFour), lenDivTwo, quadFourObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my + lenDivFour, mz - lenDivFour), lenDivTwo, quadFiveObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my + lenDivFour, mz - lenDivFour), lenDivTwo, quadSixObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my - lenDivFour, mz - lenDivFour), lenDivTwo, quadSevenObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my - lenDivFour, mz - lenDivFour), lenDivTwo, quadEightObj, drawOutline, this, scene)
            ]
            //calculates center of mass
            for (let quad of this.quads){
                if (quad.getObjCount() != 0){
                    let quadCom = quad.getCenterOfMass();
                    this.totalMass += quad.getTotalMass();
                    this.centerOfMass[0] += quadCom[0]*quad.getTotalMass();
                    this.centerOfMass[1] += quadCom[1]*quad.getTotalMass();
                    this.centerOfMass[2] += quadCom[2]*quad.getTotalMass();
                }
            }
            if (this.totalMass != 0){
                this.centerOfMass[0]/=this.totalMass
                this.centerOfMass[1]/=this.totalMass
                this.centerOfMass[2]/=this.totalMass
            }
        } else if (this.objCount == 1){
            this.centerOfMass = objects[0].getPos()
            this.totalMass = objects[0].getMass()
        }
    }
    /**
     * 
     * @returns Array
     */
    getQuads(){
        return this.quads;
    }
    /**
     * Gives the number of objects in the box
     * @returns Number
     */
    getObjCount(){
        return this.objCount;
    }
    /**
     * 
     * @returns Array
     */
    getCenterOfMass(){
        return this.centerOfMass;
    }
    /**
     * 
     * @returns Number
     */
    getTotalMass(){
        return this.totalMass;
    }
    /**
     * 
     * @returns Number
     */
    getSideLength(){
        return this.sideLength;
    }
    /**
     * 
     * @returns Array
     */
    getObjects(){
        return this.objects;
    }
    /**
     * 
     * @returns Child
     */
    getParent(){
        return this.parent
    }
    /**
     * clears quadrant
     */
    clear(){
        this.objCount = 0
        this.objects = []
    }
    /**
     * gives the net charge in this box
     * @returns Double
     */
    getCharge(){
        return this.charge
    }


}