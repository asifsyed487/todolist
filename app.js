//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
// to connect with the mongodb database, instead of 15 and 16 line, we will write the line below:

mongoose.connect('mongodb+srv://admin-arohi:Arohi123@cluster0.6lxq0.mongodb.net/todolistDB', {useUnifiedTopology: true, useNewUrlParser: true});

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your tolist!"
});

const item2 = new Item({
  name: "Hit the + button of add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Successfully saved default items to DB");
        }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }


});

});

app.post("/", function(req, res){

  // const item = req.body.newItem;
  //
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Success");
      }
    });
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

// app.get("/work", function(req,res){
//
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:topic", function(req,res){
  const listName = _.capitalize(req.params.topic);

  List.findOne({name: listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("Doesn't exist");
        const list = new List ({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      } else{
        // console.log("exists");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT  || 3000, function() {
  console.log("Server started on port 3000");
});
