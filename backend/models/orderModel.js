import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: { type: Array, required:true},
    amount: { type: Number, required: true},
    address:{type:Object,required:true},
    status: {type:String,default:"Food Processing"},
    date: {type:Date,default:Date.now()},
     paymentMethod: { type: String, enum: ["COD"], default: "COD" }, // hiện chỉ COD
    payment: { type: Boolean, default: false },  // đã thu tiền hay chưa
    paidAt: { type: Date },                      // set khi Delivered (COD)

    // Giữ trường date cũ để không phá UI cũ (song song với timestamps)
    date: { type: Date, default: Date.now },
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;