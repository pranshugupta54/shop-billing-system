//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require('lodash');
const alert = require('alert');

const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();


const homeContent = "Lacus vel facilisis volutpat est velit egestas dui ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Oio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie  iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretim quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const billContent = "";
const databaseContent = "";



let posts = []; // ??????


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/shopDB");


const itemsDBSchema = {
    itemCode: {
        type: Number,
        required: [true, 'No item code given'],
        unique: true,
        min:1000,
        max:9999
    },
    itemName: {
      type: String,
      required: [true, 'No item name given']
    },
    itemUnitPrice: {
        type: Number,
        required: [true, 'No item price given']
    },
    itemDiscount: {
        type: Number,
        required: [true, 'No item discount given']
    },
    itemStock: {
        type: Number,
        required: [true, 'No item stock given'],
        min:1
    }
};

const itemboughtSchema = {
    itemCode: Number,
    itemName: String,
    itemUPrice: Number,
    itemDisc: Number,
    itemQty: Number
}

const billsSchema = {
    userName: {
        type: String
    },
    userMob: {
        type: Number
    },
    billNo: {
        type: Number,
        required: true,
        unique: true
    },
    billDate: {
        type: String
    },
    payMeth: {
        type: String
    },
    amtRec: {
        type: Number
    },
    subTotal: {
        type: Number
    },
    disc: {
        type: Number
    },
    billValue: {
        type: Number
    },
    items: {
        type: itemboughtSchema
    }
};

const Bill = mongoose.model("Bill", billsSchema);
const Item = mongoose.model("Item", itemsDBSchema);
const Itembought = mongoose.model("Itembought", itemboughtSchema);


const item1 = new Item({
    itemCode: 2222,
    itemName: "Test",
    itemUnitPrice: 99,
    itemUPrice: 99,
    itemDisc: 9,
    itemQty:4,
    itemDiscount:1,
    itemStock:6
});


const item2 = new Item({
    itemCode: 3338,
    itemName: "Ice",
    itemUnitPrice: 87,
    itemDiscount:3,
    itemStock:5
});
  
const defaultItems = item1;

// let cartItem = '';

Item.find({itemCode: 2224}, function (err, item) {
    if (err){
        console.log(err);
    }
    else{
        console.log("Found");
        // console.log(item[0]);
    }
})

// console.log(cartItem);

const bill1 = new Bill({
    userName: "Pranshu",
    userMob: 99999999999,
    billNo: 52088,
    billDate: "22 Sept",
    payMeth: "Cash",
    amtRec: 500,
    subTotal: 220,
    disc: 20,
    billValue: 200,
    items: 1
});

// bill1.save();
// console.log(Item.find({}))

app.post("/gen", function(req,res){
    console.log(req.body);
    res.redirect("/bill");
})

app.post("/billAdd", function(req,res){
    console.log("BILLADD POST----------")
    const itemCodeRec = req.body.inputItemCode;
    // console.log(itemCodeRec);
    Item.find({itemCode: itemCodeRec}, function(err, itemFound){
        const item = itemFound[0];
        console.log(`---------Adding Item-------`);
        console.log(item);
        console.log(`---------Item-------`);
        if(itemFound == ''){
            console.log("Can't find item with code");
            res.send(`Can't find item with ${itemCodeRec}. <br> <a href="/bill">Click to go back</a>`)
            // res.redirect("/bill");
        } else if(err){
            console.log(err)
        } else {

            const addItemBill = new Itembought({
                itemCode: item.itemCode,
                itemName: item.itemName,
                itemUPrice: item.itemUnitPrice,
                itemDisc: item.itemDiscount,
                itemQty: 1
            });

            Itembought.findOne({itemCode: itemCodeRec}, function(err, foundItem){
                console.log(`FOUND: ${foundItem}`);
                console.log(err);
                if(foundItem == null){
                    console.log("WOWOWOOWOWO");
                    addItemBill.save();
                    res.redirect("/bill");
                } else if(foundItem.itemCode == itemCodeRec){
                    console.log("IN LINE---------")
                    oldQty = foundItem.itemQty + 1;
                    console.log(`HERE-------------- ${oldQty}`);
                    Itembought.update({itemCode: itemCodeRec}, {itemQty: oldQty}, function(err){console.log(err)});
                    console.log("Updated item");
                    res.redirect("/bill");
                } else {
                    res.send("Unknown Issue");
                }
            });
                    // console.log(addItemBill);
                    // addItemBill.save()
            
            // console.log(item[0]);
            
            console.log(`Saved Item[${item.itemName}] in Bill`);
            // res.redirect("/bill");
        }
    })
    console.log("OKOKOKO")
})

app.post("/billRemove", function(req,res){
    const itemDelNameID = req.body.delete;
    Itembought.findByIdAndRemove(itemDelNameID, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted");
      }
    });
    res.redirect("/bill");
});


app.get("/database", function(req, res) {
    const day = date.getDate()
    const str = req.path;
    const urlName = str.substring(str.indexOf('/') + 1);
    displayContent = `${urlName}Content`.valueOf();

    // console.log(day);
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0) {
          Item.insertMany(defaultItems, function(err){
            if (err) {
              console.log(err);
            } else {
              console.log("Added items");
            }
        });
        res.redirect("/database");
        } else {
        res.render("database", {billDate: day, newListItems: foundItems});
        }
    });
});



app.post("/databaseAdd", function(req,res){
    const itemAdd = req.body;
    // console.log(itemAdd);
    const newItem = new Item({
        itemCode: itemAdd.code,
        itemName: itemAdd.name,
        itemUnitPrice: itemAdd.price,
        itemDiscount: itemAdd.discount,
        itemStock: itemAdd.stock
    });
    newItem.save();
    // res.send("OK");
    res.redirect("/database");
})

app.post("/databaseRemove", function(req,res){
    const itemDelNameID = req.body.delete;
    Item.findByIdAndRemove(itemDelNameID, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted");
      }
    });
    res.redirect("/database");
});



app.get("/bill", function(req,res){
    const day = date.getDate()
    const str = req.path;
    const urlName = str.substring(str.indexOf('/') + 1);
    displayContent = `${urlName}Content`.valueOf();

    // console.log(day);
    Itembought.find({}, function(err, foundItems){
        if(foundItems.length === 0) {
        //   Itembought.insertMany(defaultItems, function(err){
        //     if (err) {
        //       console.log(err);
        //     } else {
        //       console.log("Added items");
        //     }
        // });
        // res.redirect("/bill");
        console.log("No Item");
        res.render("bill", {billDate: day, newListItems: foundItems, discount: 5});
        } else {
            // console.log(foundItems);
            res.render("bill", {billDate: day, newListItems: foundItems, discount: 5});
        };
    });
});



urlReq = ['/about', '/contact']

app.get(urlReq, function(req,res){
  const str = req.path;
  const urlName = str.substring(str.indexOf('/') + 1);
  displayContent = `${urlName}Content`.valueOf();

  // res.send(eval(displayContent));
  res.render(urlName, {startingContent: eval(displayContent)});
})

app.get(["/", '/home'], function(req,res){
  res.render("home", {startingContent: homeContent, posts : posts});
})

app.get("/compose", function(req,res){
  res.render("compose");
})

app.post("/compose", function(req,res){
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  };
  posts.push(post);
  // console.log(posts);
  res.redirect("/");
})


app.get("/posts/:postName", function(req,res){
  const requestTitle = _.lowerCase(req.params.postName);
  posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);

    if(storedTitle == requestTitle){
      res.render("post", {postFull: post})
    }



    // else{
    //   console.log("Not matched");
    //   console.log(requestTitle,storedTitle)
    //   unknown = {
    //     title: "404",
    //     content: "Not Found"
    //   }
    //   res.render("post", {postFull:unknown})
    // }
  })
})





app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
