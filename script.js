const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/sampleDB",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to todoList App.."
});

const item2 = new Item({
    name:"Hit + button to push the item into the list"
});

const item3 = new Item({
    name:"Hit checkbox to delete the item from the list"
});

const defaultItems = [item1,item2,item3];




app.get("/",function(req,res){
    
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Your items are inserted successfully into the database..");
            }).catch(function(err){
                console.log(err);
            });
            res.redirect("/");
        } else {
            res.render("list",{listTitle:"Today",newListItems:foundItems});
        }
    })
    
});



app.listen(3000,()=>{
    console.log("Your server is running on port 3000");
});

