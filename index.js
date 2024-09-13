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

app.get('/card',async(req,res)=>{

  let chickens = await StockModel.find({'name':'Chicken'});
    let muttons = await StockModel.find({'name':'Mutton'});
    let frozens = await StockModel.find({'name':'SKM Frozen item'});
    let oils = await StockModel.find({'name':'Oil'});
    let meats = await StockModel.find({'name':'Meat'});  
    
    let chicken = Number(chickens[0].stock)+Number(chickens[1].stock);
    let mutton = muttons[0].stock;
    let frozen = frozens[0].stock;
    let oil = oils[0].stock;
    let meat = meats[0].stock;

    let achicken = Number(chickens[0].quantity)+Number(chickens[1].quantity);
    let amutton = muttons[0].quantity;
    let afrozen = frozens[0].quantity;
    let aoil = oils[0].quantity;
    let ameat = meats[0].quantity;

    res.json({'msg':'success','Items':{chicken,mutton,frozen,oil,meat,achicken,amutton,afrozen,aoil,ameat}});

})

app.get('/chart',async(req,res)=>{

  let chickens = await SalesModel.find({'Type':'Chicken'});
    let muttons = await SalesModel.find({'Type':'Mutton'});
    let frozens = await SalesModel.find({'Type':'SKM Frozen item'});
    let oils = await SalesModel.find({'Type':'Oil'});
    let meats = await SalesModel.find({'Type':'Meat'});

    var chicken = 0;
    chickens.map((e)=>{
      chicken+=Number(e.NoOfKg);
    })

    var mutton = 0;
    muttons.map((e)=>{
      mutton+=Number(e.NoOfKg);
    })

    var frozen = 0;
    frozens.map((e)=>{
      frozen+=Number(e.NoOfKg);
    })

    var oil = 0;
    oils.map((e)=>{
      oil+=Number(e.NoOfKg);
    })

    var meat = 0;
    meats.map((e)=>{
      meat+=Number(e.NoOfKg);
    })

    res.json({'msg':'success','Items':{chicken,mutton,meat,frozen,oil}});

})

app.get('/graph',async(req,res)=>{
  const today = new Date();
  const currentDay = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDay);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // months are 0-based
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    weekDays.push(formatDate(day));
  }

  var max = 0;

  let chicken = [];
  let mutton = [];
  let frozen = [];
  let oil = [];
  let meat = [];
  let chickdata = await SalesModel.find({'Type':'Chicken'});
  let muttondata = await SalesModel.find({'Type':'Mutton'});
  let frozendata = await SalesModel.find({'Type':'SKM Frozen item'});
  let oildata = await SalesModel.find({'Type':'Oil'});
  let meetdata = await SalesModel.find({'Type':'Meat'});

  weekDays.map((item)=>{
    let chickens = chickdata.filter(elem=>(elem.Date == item)) || [];
    let muttons = muttondata.filter(elem=>(elem.Date == item)) || [];
    let frozens = frozendata.filter(elem=>(elem.Date == item)) || [];
    let oils = oildata.filter(elem=>(elem.Date == item)) || [];
    let meats = meetdata.filter(elem=>(elem.Date == item)) || [];

    var totchicken = 0;
    chickens.map((e)=>{
      if(e>max){
        max=e;
      }
      totchicken+=Number(e.NoOfKg);
    })

    var totmutton = 0;
    muttons.map((e)=>{
      if(e>max){
        max=e;
      }
      totmutton+=Number(e.NoOfKg);
    })

    var totfrozen = 0;
    frozens.map((e)=>{
      if(e>max){
        max=e;
      }
      totfrozen+=Number(e.NoOfKg);
    })

    var totoil = 0;
    oils.map((e)=>{
      if(e>max){
        max=e;
      }
      totoil+=Number(e.NoOfKg);
    })

    var totmeat = 0;
    meats.map((e)=>{
      if(e>max){
        max=e;
      }
      totmeat+=Number(e.NoOfKg);
    })

    chicken.push(totchicken);
    mutton.push(totmutton);
    frozen.push(totfrozen);
    oil.push(totoil);
    meat.push(totmeat);
  })

  max = Math.floor(max/10) + 10;

  res.json({'msg':'success','Items':{chicken,mutton,frozen,oil,meat,max}});
})

app.get('/today',async(req,res)=>{
  const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1; 
const day = today.getDate();
const formattedDate = `${year}-${month}-${day}`;
  try{
    const data = await SalesModel.find({'Date':formattedDate});
         var cost = 0;
      data.map((item) => {
        let val = (item.TotalAmount).substring(1);
        cost += Number(val);
      })
    res.json({'Items':data,'msg':'success','total':cost})
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