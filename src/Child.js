import * as THREE from 'three'

const Vector = require('./Vector').default;

export default class Child {
    
    constructor(midPoint, sideLength, objects, drawOutline, parent, scene) {
        this.midPoint = midPoint;
        this.sideLength=sideLength;
        this.objects=objects;
        this.objCount = objects.length
        this.scene = scene
        this.totalMass = 0; 
        this.parent = parent

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

            //there is definitly a better way to do this but im lazy
            this.quads = [new Child(new Vector(mx - lenDivFour, my + lenDivFour, mz + lenDivFour), lenDivTwo, quadOneObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my + lenDivFour, mz + lenDivFour), lenDivTwo, quadTwoObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my - lenDivFour, mz + lenDivFour), lenDivTwo, quadThreeObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my - lenDivFour, mz + lenDivFour), lenDivTwo, quadFourObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my + lenDivFour, mz - lenDivFour), lenDivTwo, quadFiveObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my + lenDivFour, mz - lenDivFour), lenDivTwo, quadSixObj, drawOutline, this, scene),
            new Child(new Vector(mx - lenDivFour, my - lenDivFour, mz - lenDivFour), lenDivTwo, quadSevenObj, drawOutline, this, scene),
            new Child(new Vector(mx + lenDivFour, my - lenDivFour, mz - lenDivFour), lenDivTwo, quadEightObj, drawOutline, this, scene)
            ]
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
    getQuads(){
        return this.quads;
    }
    getObjCount(){
        return this.objCount;
    }
    getCenterOfMass(){
        return this.centerOfMass;
    }
    getTotalMass(){
        return this.totalMass;
    }
    getSideLength(){
        return this.sideLength;
    }
    getObjects(){
        return this.objects;
    }
    getParent(){
        return this.parent
    }
    clear(){
        this.objCount = 0
        this.objects = []
    }


}