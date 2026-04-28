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
    <title>Admin Dashboard</title>
    <style>
      body {
        margin:0;
        font-family: 'Segoe UI', sans-serif;
        background: #0f172a;
        color: white;
      }

      .container {
        max-width: 1100px;
        margin: auto;
        padding: 20px;
      }

      h1 {
        text-align: center;
        margin-bottom: 30px;
      }

      .card {
        background: #1e293b;
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      }

      .card h2 {
        margin-bottom: 15px;
      }

      input {
        width: 100%;
        padding: 12px;
        margin-bottom: 10px;
        border-radius: 8px;
        border: none;
        outline: none;
        background: #0f172a;
        color: white;
      }

      input::placeholder {
        color: #94a3b8;
      }

      button {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(45deg,#3b82f6,#06b6d4);
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
      }

      button:hover {
        transform: scale(1.03);
      }

      .orders {
        display: grid;
        gap: 15px;
      }

      .order {
        background: #020617;
        padding: 15px;
        border-radius: 10px;
        border-left: 5px solid orange;
      }

      .confirmed {
        border-left: 5px solid limegreen;
      }

      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status {
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
      }

      .pending {
        background: orange;
        color: black;
      }

      .done {
        background: limegreen;
        color: black;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>⚙️ Admin Dashboard</h1>

      <div class="card">
        <h2>Add Product</h2>
        <input id="name" placeholder="Product Name" />
        <input id="price" placeholder="Price (e.g. 120)" />
        <input id="image" placeholder="Image URL" />
        <button onclick="add()">Add Product</button>
      </div>

      <div class="card">
        <h2>Orders</h2>
        <div class="orders" id="orders"></div>
      </div>
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
        alert('✅ Product Added');
      }

      async function loadOrders(){
        let res = await fetch('/api/orders');
        let data = await res.json();

        document.getElementById('orders').innerHTML = data.map(o=>\`
          <div class="order \${o.status === 'confirmed' ? 'confirmed' : ''}">
            <div class="top">
              <strong>Order #\${o.id}</strong>
              <span class="status \${o.status === 'confirmed' ? 'done' : 'pending'}">
                \${o.status}
              </span>
            </div>
            <p>📞 \${o.phone}</p>
            <button onclick="update(\${o.id})">Confirm Order</button>
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
