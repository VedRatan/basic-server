
// imports from packages
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

//init
const app = express();
const DB = process.env.MONGO_URI

//imports from other files
const authRouter = require("./routes/auth")
// console.log(process.env.A)
//middleware
app.use(express.json());
app.use(authRouter);

//Connections
mongoose.connect(DB).then(()=> {
 console.log('connected to the database');
}).catch(e=>{
    console.log(e);
});



app.listen(process.env.PORT, ()=>{
console.log(`connected at port ${process.env.PORT}`);
});

