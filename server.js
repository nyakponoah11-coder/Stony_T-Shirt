const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ================= PRODUCTS ================= */
app.get("/products", async (req,res)=>{
  const { data } = await supabase.from("products").select("*");
  res.json(data);
});

app.post("/products", async (req,res)=>{
  const { data } = await supabase
    .from("products")
    .insert([req.body])
    .select();

  res.json(data);
});

/* ================= ORDERS ================= */
app.get("/orders", async (req,res)=>{
  const { data } = await supabase.from("orders").select("*");
  res.json(data);
});

app.post("/orders", async (req,res)=>{
  const { data } = await supabase
    .from("orders")
    .insert([{ ...req.body, status:"Pending" }])
    .select();

  res.json(data);
});

app.patch("/orders/:id", async (req,res)=>{
  const { id } = req.params;

  const { data } = await supabase
    .from("orders")
    .update(req.body)
    .eq("id", id)
    .select();

  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log("Server running on " + PORT);
});
