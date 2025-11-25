import express from "express";
import bodyParser from "body-parser";
import path from "path"

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

export default app;

const isDirectRun = (process.argv[1] && process.argv[1].endsWith('server.js'));
if (isDirectRun) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}