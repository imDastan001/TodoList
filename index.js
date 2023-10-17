import express  from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

mongoose.connect("mongodb://127.0.0.1:27017/TodoList");
const todaySchema =new mongoose.Schema({
    name:String
});

const Today=mongoose.model('Today',todaySchema);
const todo1=new Today({
    name:"Enter your todo"
});
const defaulttodoitems =[todo1];


const customSchema= new mongoose.Schema({
    name:String,
    items:[{
        name:String
    }]
});

const Custom = mongoose.model("Custom",customSchema);




const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/",async(req,res)=>{
const foundItems= (await(Today.find({})));
if(foundItems.length===0){
    Today.insertMany(defaulttodoitems)
    res.redirect("/");
}
else{
res.render("index.ejs",{
    custom:"Today",
    htmlContent:foundItems
});
}
});

app.get("/menu",async(req,res)=>{
    const menuList=await Custom.find({ name: { $ne: 'Favicon.ico' } });
    res.render("menu.ejs",{
        custom: "Todo Menu",
        htmlContent: menuList
    });
});



app.post("/submit",async(req,res)=>{
    var value = req.body["inputfield"];
    var listName = req.body.Listname
    if(value){
    if(listName==="Today"){

            const todo= new Today({
                name:value
            });
            todo.save()
            
            res.redirect("/");
    }
    else{

            var itemsToAdd={name:value}
        await (Custom.updateOne({name:listName},{$push: {items:itemsToAdd}}));
        res.redirect("/"+listName);    
    }
    }
    

  
});



app.post("/delete",async(req,res)=>{
const id = req.body.check;
const name = req.body.hiddencheckbox;
if(name==="Today"){
await Today.deleteOne({_id:id});

res.redirect("/");
}
else{
    await (Custom.updateOne({name:name},{$pull: {items:{_id:id}}}));
    res.redirect("/"+name);
}
});
app.post("/menudelete",async(req,res)=>{
const menuid = req.body.check;
await Custom.findByIdAndDelete(menuid)
res.redirect("/menu");
});

app.get("/:custompage",async(req,res)=>{
const cusname = _.capitalize(req.params.custompage);
const list = await (Custom.findOne({name:cusname}));
if(!list){
const todos = new Custom({
    name:cusname,
    items:[{name:"Enter your todo"}]
});
todos.save();
res.redirect("/menu");
}
else{
    res.render("index.ejs",{
        custom:list.name,
        htmlContent:list.items
    });

}


});

app.post("/menusubmit",(req,res)=>{
const name = req.body.inputfield;
res.redirect("/"+name);

});

app.listen(3000,()=>{
console.log("server start");
});


