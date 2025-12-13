import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: { 
        type: Array, 
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Items array cannot be empty'
        }
    },
    amount: { type: Number, required: true},
    address:{type:Object,required:true},
    status: {type:String,default:"Food Processing"},
    date: {type:Date,default:Date.now()},
     paymentMethod: { type: String, enum: ["COD"], default: "COD" }, // hiện chỉ COD
    payment: { type: Boolean, default: false },  // đã thu tiền hay chưa
    paidAt: { type: Date },                      // set khi Delivered (COD)
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;