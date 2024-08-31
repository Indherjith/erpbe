const mongoose = require("mongoose");

const importSchema = new mongoose.Schema({
    Category: {type:String,required:true},
    Date: {type:String,required:true},
    NoOfKg: {type:String,required:true},
    PricePerKg: {type:String,required:true},
    Time: {type:String,required:true},
    TotalAmount: {type:String,required:true},
    Type: {type:String,required:true},
})

const ImportModel = mongoose.model("import",importSchema);

module.exports = {
    ImportModel
}