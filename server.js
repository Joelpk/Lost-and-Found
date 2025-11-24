import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) =>{
  res.render("index.ejs");
})

app.get("/foundItem.ejs", (req, res) =>{
  res.render("foundItem.ejs");
})

app.get("/reportFoundItem.ejs", (req, res) =>{
  res.render("reportFoundItem.ejs");
})

app.get("/reportLostItem.ejs", (req, res) =>{
  res.render("reportLostItem.ejs");
})

app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`)
});