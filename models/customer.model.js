const mongoose = require('mongoose')
const customerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    history:[{
        orderId:{
            type: mongoose.Schema.Types.ObjectId
        }
    }]
})

customerSchema.statics.checkIfUserExist=function(email){
    return this.findOne({email: new RegExp(email,"i")})
}

customerSchema.statics.saveCustomer=async function(name,email){
    const ifExists=await this.checkIfUserExist(email)
    if(!ifExists){
        const user = new this({name,email})
        const newUser = await user.save()
        return newUser._id
    }
    return this.getCustomerId(email)
}

customerSchema.statics.getCustomerId= async function(email){
    const res= await this.findOne({email: new RegExp(email,"i")},"_id")
    return res._id;
}

customerSchema.statics.updateOrderList=function(customerId,orderId){
    return this.updateOne({_id:customerId},{$push:{history:{orderId:orderId}}})
}

module.exports = mongoose.model('customer',customerSchema)