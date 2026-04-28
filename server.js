require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ SUPABASE ENV
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ================= API =================

// ADD PRODUCT
app.post("/api/add-product", async (req, res) => {
  const { name, price, image } = req.body;
  const { error } = await supabase.from("products").insert([{ name, price, image }]);
  if (error) return res.json({ error });
  res.json({ success: true });
});

// GET PRODUCTS
app.get("/api/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return res.json({ error });
  res.json(data);
});

// CREATE ORDER
app.post("/api/order", async (req, res) => {
  const { product_id, phone } = req.body;
  const { error } = await supabase
    .from("orders")
    .insert([{ product_id, phone, status: "pending" }]);

  if (error) return res.json({ error });
  res.json({ success: true });
});

// GET ORDERS
app.get("/api/orders", async (req, res) => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) return res.json({ error });
  res.json(data);
});

// UPDATE STATUS
app.post("/api/update-status", async (req, res) => {
  const { id, status } = req.body;
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return res.json({ error });
  res.json({ success: true });
});

// ================= STORE =================
app.get("/store", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Store</title>
    <style>
      body {
        margin:0;
        font-family: Arial;
        background:#0f172a;
        color:white;
      }
      .grid {
        display:grid;
        grid-template-columns: repeat(auto-fit,minmax(250px,1fr));
        gap:20px;
        padding:20px;
      }
      .card {
        background:#1e293b;
        border-radius:10px;
        overflow:hidden;
      }
      img {
        width:100%;
        height:250px;
        object-fit:cover;
      }
      .content { padding:15px; }
      button {
        width:100%;
        padding:10px;
        background:#3b82f6;
        border:none;
        color:white;
        cursor:pointer;
      }
    </style>
  </head>
  <body>
    <h1 style="text-align:center;">🔥 Store</h1>
    <div class="grid" id="products"></div>

    <script>
      async function load(){
        let res = await fetch('/api/products');
        let data = await res.json();

        document.getElementById('products').innerHTML = data.map(p=>\`
          <div class="card">
            <img src="\${p.image}" />
            <div class="content">
              <h3>\${p.name}</h3>
              <p>₵\${p.price}</p>
              <button onclick="order(\${p.id})">Order</button>
            </div>
          </div>
        \`).join('');
      }

      async function order(id){
        let phone = prompt("Enter WhatsApp Number");
        if(!phone) return;

        await fetch('/api/order',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ product_id:id, phone })
        });

        alert("Order placed!");
      }

      load();
    </script>
  </body>
  </html>
  `);
});

// ================= ADMIN =================
app.get("/admin", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Admin</title>
    <style>
      body { background:#020617; color:white; font-family:Arial; padding:20px; }
      input,button { padding:10px; margin:5px; width:100%; }
      .box { background:#1e293b; padding:15px; margin-bottom:20px; }
    </style>
  </head>
  <body>
    <h1>Admin Dashboard</h1>

    <div class="box">
      <h3>Add Product</h3>
      <input id="name" placeholder="Name">
      <input id="price" placeholder="Price">
      <input id="image" placeholder="Image URL">
      <button onclick="add()">Add</button>
    </div>

    <div class="box">
      <h3>Orders</h3>
      <div id="orders"></div>
    </div>

    <script>
      async function add(){
        await fetch('/api/add-product',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            name:name.value,
            price:price.value,
            image:image.value
          })
        });
        alert("Added");
      }

      async function loadOrders(){
        let res = await fetch('/api/orders');
        let data = await res.json();

        document.getElementById('orders').innerHTML = data.map(o=>\`
          <div>
            <p>ID: \${o.id}</p>
            <p>Phone: \${o.phone}</p>
            <p>Status: \${o.status}</p>
            <button onclick="update(\${o.id})">Confirm</button>
          </div>
        \`).join('');
      }

      async function update(id){
        await fetch('/api/update-status',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id, status:'confirmed' })
        });
        loadOrders();
      }

      loadOrders();
    </script>
  </body>
  </html>
  `);
});

// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
