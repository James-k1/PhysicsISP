export default class Vector {
    
    constructor(xComp, yComp, zComp) {
      this.xComp = xComp
      this.yComp = yComp
      this.zComp = zComp
    }
  
    add(v) {
      this.xComp+=v.getXComp()
      this.yComp+=v.getYComp()
      this.zComp+=v.getZComp()
    }
    getXComp(){
        return this.xComp
    }
    getYComp(){
        return this.yComp
    }
    getZComp(){
        return this.zComp
    }
    setXComp(x){
        this.xComp=x
    }
    setYComp(y){
        this.yComp=y
    }
    setZComp(z){
        this.zComp=z
    }

}