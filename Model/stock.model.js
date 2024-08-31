const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    stock: {type:String,required:true},
    quantity: {type:String,required:true},
    rate: {type:String,required:true},
    price: {type:String,required:true},
    status: {type:String,required:true},
    name: {type:String,required:true},
    type:{type:String,required:true}
})

const StockModel = mongoose.model("stock",stockSchema);

module.exports = {
    StockModel
}