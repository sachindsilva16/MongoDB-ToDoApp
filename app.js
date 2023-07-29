// EXPRESS MODULES
const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");

// USING 'express' MODULE...
const app = express();

// IMPORTING MONGOOSE 
const mongoose = require('mongoose');

// IMPORTING LODASH MODULE

const _ = require('lodash');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// MONGOOSE CONNECTION LINK :: AND CONNECTING/CREATING DATABASE 'toDoListItems'..

// mongoose.connect("mongodb+srv://sachindsilva16:Rockerzzdown1@cluster0.0ruhws2.mongodb.net/toDoListItems", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://sachindsilva16:Rockerzzdown1@cluster0.0ruhws2.mongodb.net/toDoListItems", { useNewUrlParser: true });

// DEFINE A SCHEMA FOR THE TODO ITEMS

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// MODEL :: 'Item'-->'items'

const Item = mongoose.model("Item", itemsSchema);


// DECLARING THE 3 DEFAULT ITEMS

const item1 = new Item({
  name: "Welcome to the todolist!"
});

const item2 = new Item({
  name: "Hit + button to push the item to the list..."
});

const item3 = new Item({
  name: "Hit checkbox to delete the item..."
});

const defaultItems = [item1, item2, item3];

const listSchema = {

  name: String,
  items: [itemsSchema]

};

const List = mongoose.model("List", listSchema);


// GET REQUEST :: '/'

app.get("/", function (req, res) {

  Item.find({}).then(function (foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully inserted your items...");
      }).catch(function (err) {
        console.log(err);
      });

      res.redirect("/");


    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });

    }

  }).catch(function (err) {
    console.log(err);
  });




});

// CUSTOM LIST :: USING EXPRESS ROUTE PARAMETERS

app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundList) {


    if (!foundList) {
      //  Add that customListName to the 'lists' collection

      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();

      res.redirect("/" + customListName);


    } else {
      // console.log("Exists");

      // Show that (RENDER) 'customListName' with defaultItems


      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

    }



  }).catch(function (err) {
    console.log(err);
  });


});



// POST REQUEST :: '/'

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }



});


// POST REQUEST :: '/delete'

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);


  // SYNTAX : <ModelName>.findByIdAndRemove(<Id>).then(callback function).catch(function(err){
  //   console.log(err);
  // })

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Your item has been successfully removed from the database...");
    }).catch(function (err) {
      console.log(err);
    });

    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function(foundList){

      res.redirect("/"+listName);

    }).catch(function(err){
      console.log(err);
    })

  }

});


// SERVER LISTENING....

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});
