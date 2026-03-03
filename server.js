import express, { response } from "express";
import bodyParser from "body-parser";
import { createClient } from '@supabase/supabase-js'
import multer from "multer"; // for file upload (photo)
import dotenv from "dotenv";
import path from 'path'

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
const PORT = 3000;
// const upload = multer({storage: multer.memoryStorage()})
const storage = multer.memoryStorage()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'), false);
        }
    }
});

async function uploadImage(file) {
  if (!file) return null;

  const fileName =
    Date.now() + "-" + file.originalname.replace(/\s+/g, "_");

  const { error: uploadError } = await supabase.storage
    .from("reports-images")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Image upload failed");
  }

  const { data } = supabase.storage
    .from("reports-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) =>{
  const success = req.query.success;
  res.render("index.ejs", {success})
})

app.get("/item/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: item, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !item) {
      return res.status(404).send("Item not found");
    }

    res.render("itemDetails.ejs", { item });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/foundItem.ejs", async(req, res) =>{
  try {
    const { data: items, error } = await supabase
      .from("reports")
      .select("*")
      .eq("type", "found")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).send("Error loading found items");
    }

    res.render("foundItem.ejs", { items });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
})

app.get("/reportFoundItem.ejs", (req, res) =>{
  res.render("reportFoundItem.ejs");
})

app.get("/reportLostItem.ejs", (req, res) =>{
  res.render("reportLostItem.ejs");
})

app.get("/login.ejs", (req, res) =>{
  res.render("login.ejs")
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

app.post("/login", (req, res) =>{
  console.log(req.body)
  res.render("index.ejs")
})

app.post("/api/chatbot", async (req, res) => {
  const message = req.body?.message;
  console.log(req.body)

  if (!message) {
    return res.json({ reply: "Please type a message so I can help 😊" });
  }

  let reply = "I'm here to help!";

  const text = message.toLowerCase();

  if (text.includes("lost")) {
    reply = "You can report a lost item using the Report Lost page.";
  } else if (text.includes("found")) {
    reply = "Found an item? Please use the Report Found page.";
  } else if (text.includes("contact")) {
    reply = "If you see a matching item, contact details will be shown securely.";
  }

  res.json({ reply });
});


app.post("/report-lost", upload.single("image"), async (req, res) => {
  // console.log(req.body)
  console.log("FILE OBJECT:", req.file);
  try {
    const {
      itemName, category, description, location, eventDate, fullName, email, phone
    } = req.body;
    const imageUrl = await uploadImage(req.file);

    // Basic validation (matches NOT NULL columns)
    if (!itemName || !fullName) {
      return res.status(400).send("Item name and full name are required");
    }

    const { error } = await supabase
      .from("reports")
      .insert([
        {
          type: "lost", item_name: itemName, category: category || null, description: description || null, location:location || null, event_date: eventDate || null, full_name: fullName, email: email || null,
          phone: phone || null, image_url: imageUrl,status: "open"
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


app.post("/report-found", upload.single("image"), async(req, res) =>{
  // console.log(req.body)
  try {
    const {
      itemName, category, description, location, eventDate, fullName, email, phone
    } = req.body;
    const imageUrl = await uploadImage(req.file);

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
          image_url: imageUrl,
          status: "open"
        }
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).send("Failed to save report");
    }
    res.redirect("/?success=found");
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