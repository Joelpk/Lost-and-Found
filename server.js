import express, { response } from "express";
import bodyParser from "body-parser";
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

app.get("/admin.ejs", (req, res) =>{
  res.render("admin.ejs");
})

app.post("/report-lost", async(req, res) =>{
  const{
    itemName, location, eventDate, description, fullName, email, phone
  } = req.body;

  try{
    const {error} = await supabase.from("reports").insert([
      {
        type: "lost", itemName: itemName, location: location, event_date: eventDate, description: description, full_name: fullName, email: email, phone: phone, status:"open"
      }
    ]);
    if(error){
      console.error("Error inserting lost report:", error);
      return res.status(500).send("An error occured while saving your report");
    }
    res.redirect("/");
  }catch(err){
    res.status(500).send("Error while saving your report");
  }

})

app.post("/report-found", async(req, res) =>{
  const{
    itemName, location, eventDate, description, fullName, email, phone
  } = req.body;

  try{
    const {error} = await supabase.from("reports").insert([
      {
        type: "found", itemName: itemName, location: location, event_date: eventDate, description: description, full_name: fullName, email: email, phone: phone, status:"open"
      }
    ]);
    if(error){
      console.error("Error inserting lost report:", error);
      return res.status(500).send("An error occured while saving your report");
    }
    res.redirect("/");
  }catch(err){
    res.status(500).send("Error while saving your report");
  }
  
})

app.get("/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("id, type, item_name, created_at")
      .limit(5);

    if (error) {
      console.error("Supabase test error:", error);
      return res.status(500).send("Supabase error: " + error.message);
    }

    res.send(data || []);
  } catch (err) {
    console.error("Unexpected Supabase test error:", err);
    res.status(500).send("Unexpected error: " + err.message);
  }
});


  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });