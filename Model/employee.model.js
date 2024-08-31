const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    userId : {type:String,required:true},
    password : {type:String,required:true}
})

const EmployeeModel = mongoose.model("employee",employeeSchema);

module.exports = {
    EmployeeModel
}