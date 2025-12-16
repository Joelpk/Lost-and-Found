import express, { response } from "express";
import bodyParser from "body-parser";
import { createClient } from '@supabase/supabase-js'
import multer from "multer"; // for file upload (photo)
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
const PORT = 3000;
// const upload = multer({storage: multer.memoryStorage()})

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

app.get("/admin.ejs", async (req, res) => {
  try {
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return res.status(500).send("Failed to load admin dashboard");
    }

    res.render("admin.ejs", { reports });
  } catch (err) {
    console.error("Admin route error:", err);
    res.status(500).send("Server error");
  }
});


app.post("/report-lost", async (req, res) => {
  console.log(req.body)
  try {
    const {
      itemName,
      category,
      description,
      location,
      eventDate,
      fullName,
      email,
      phone
    } = req.body;

    // Basic validation (matches NOT NULL columns)
    if (!itemName || !fullName) {
      return res.status(400).send("Item name and full name are required");
    }

    const { error } = await supabase
      .from("reports")
      .insert([
        {
          type: "lost",
          item_name: itemName,
          category: category || null,
          description: description || null,
          location: location || null,
          event_date: eventDate || null,
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          status: "open"
        }
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).send("Failed to save report");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
});


app.post("/report-found", async(req, res) =>{
  console.log(req.body)
  try {
    const {
      itemName,
      category,
      description,
      location,
      eventDate,
      fullName,
      email,
      phone
    } = req.body;

    // Basic validation (matches NOT NULL columns)
    if (!itemName || !fullName) {
      return res.status(400).send("Item name and full name are required");
    }

    const { error } = await supabase
      .from("reports")
      .insert([
        {
          type: "found",
          item_name: itemName,
          category: category || null,
          description: description || null,
          location: location || null,
          event_date: eventDate || null,
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          status: "open"
        }
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).send("Failed to save report");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
});
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