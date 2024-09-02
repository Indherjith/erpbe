const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connection = require('./config/db');
const {AdminModel} = require('./Model/admin.model');
const {EmployeeModel} = require('./Model/employee.model');
const {ImportModel} = require('./Model/import.model');
const {StockModel} = require('./Model/stock.model');
const {SalesModel} = require('./Model/sales.model');


const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/admin',async(req,res)=>{
  let admin = await AdminModel.find({'userId':req.body.userId,'password':req.body.password});  
  if(admin.length != 0){
    res.send("success");
  }
  else{
    res.send("failure");
  }
});

app.post('/employee',async(req,res)=>{
  let employee = await EmployeeModel.find({'userId':req.body.userId,'password':req.body.password});  
  if(employee.length != 0){
    res.send("success");
  }
  else{
    res.send("failure");
  }
});

app.get('/imports',async(req,res)=>{
  try{
      let data = await ImportModel.find();
      res.json({"Items":data,"msg":"Data Fetched Successfully"})
  }
  catch(err){
    console.log(err);
    res.json({"msg":"Something went wrong","Items":[]});
  }

})

app.post('/imports', async (req, res) => {
  console.log(req.body);
  const importitem = new ImportModel(req.body);

  try {
    const forstocks = {
      name: req.body.Type,
      stock: req.body.NoOfKg,
      quantity: req.body.NoOfKg,
      rate: req.body.PricePerKg,
      price: req.body.PricePerKg * req.body.NoOfKg,
      status: "In Stock",
      type: req.body.Category
    };

    const itemavail = await StockModel.findOne({ name: req.body.Type, type: req.body.Category });

    if (itemavail) {
      console.log('already available', itemavail);

      const updateStock = await StockModel.findOneAndUpdate(
        { _id: itemavail._id },
        {
          quantity: Number(itemavail.quantity) + Number(forstocks.quantity),
          rate: forstocks.rate,
          stock: Number(itemavail.stock) + Number(forstocks.stock),
          status: (Number(itemavail.quantity) + Number(forstocks.quantity)) > 0 ? "In Stock" : "Out Of Stock",
          price: (Number(itemavail.stock) + Number(forstocks.stock)) * Number(forstocks.rate),
        },
        { new: true }  // This option returns the updated document
      );
      console.log('Updated Stock:', updateStock);
      await importitem.save();
      res.json({ "msg": "Item Added Successfully" });
    } else {
      const stocksitem = new StockModel({ ...forstocks });
      await stocksitem.save();
      await importitem.save();
      res.json({ "msg": "Item Added Successfully" });
    }
  } catch (err) {
    console.log(err);
    res.json({ "msg": "Something went wrong" });
  }
});


app.get('/stocks',async(req,res)=>{
  try{
      let data = await StockModel.find();
      res.json({"Items":data,"msg":"Data Fetched Successfully"})
  }
  catch(err){
    console.log(err);
    res.json({"msg":"Something went wrong","Items":[]});
  }

})
app.get('/sales',async(req,res)=>{
  try{
    const data = await SalesModel.find();
    res.json({'Items':data,'msg':'success'})
  }
  catch(err){
    console.log(err);
    res.json({'msg':'Data Not Found'})    
  }
})

app.post('/sales',async(req,res)=>{
  const timestamp = Date.now();
  const currentDate = new Date(timestamp);  // Changed variable name to currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const formattedDate = `${year}-${month}-${day}`; // Changed variable name to formattedDate
  const formattedTime = `${hours}:${minutes}:${seconds}`;

const {data,tax} = req.body;
try{
  for (let item of data) {
    const sale = new SalesModel({       
      Date:formattedDate,          
      Time:formattedTime,          
      Type:item.name,
      Category:item.category,
      NoOfKg:item.quantity,
      PricePerKg:item.rate,
      TotalAmount:item.total        
    });
    const availstock = await StockModel.findOne({name:sale.Type,type:sale.Category})
    const stockit = await StockModel.findOneAndUpdate({name:sale.Type,type:sale.Category},{
      quantity : Number(availstock.quantity)-Number(sale.NoOfKg)
    });

    await sale.save(); // Save each item to the database
  }
  res.json({'msg':'success'});
}
catch(err){
  console.log(err);
  res.json({'msg':'failed'})
  
}
})



app.listen(port, async() => {
    try{
      await connection;
      console.log('Connected to database');
    }catch(error){
        console.log(error); 
    }
    console.log(`Server is listening on port ${port}`)
  })