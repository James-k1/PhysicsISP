export default class Vector {
    /**
     * 
     * @param {*} xComp Double, x component of vector  
     * @param {*} yComp Double, y component of vector 
     * @param {*} zComp Double, z component of vector 
     */
    constructor(xComp, yComp, zComp) {
        this.xComp = xComp
        this.yComp = yComp
        this.zComp = zComp
    }
    /**
     * 
     * @param {*} v Vector to add to this vector
     */
    add(v) {
        this.xComp += v.getXComp()
        this.yComp += v.getYComp()
        this.zComp += v.getZComp()
    }
    /**
     * 
     * @param {*} s Vector to mutiply components with this vector
     */
    mult(s) {
        this.xComp *= s
        this.yComp *= s
        this.zComp *= s
    }
    /**
     * 
     * @returns Number
     */
    getXComp() {
        return this.xComp
    }
    /**
     * 
     * @returns Number
     */
    getYComp() {
        return this.yComp
    }
    /**
     * 
     * @returns Number
     */
    getZComp() {
        return this.zComp
    }
    /**
     * 
     * @param {*} x New x component for this vector
     */
    setXComp(x) {
        this.xComp = x
    }
    /**
     * 
     * @param {*} y New y component for this vector
     */
    setYComp(y) {
        this.yComp = y
    }
    /**
     * 
     * @param {*} z New y component for this vector
     */
    setZComp(z) {
        this.zComp = z
    }

}