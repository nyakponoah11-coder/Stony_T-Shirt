import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then(res => setProducts(res.data));
  }, []);

  return (
    <div style={styles.body}>

      <h1 style={styles.logo}>NESTY WEAR</h1>

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <img src={p.image} style={styles.image} />

            <div style={styles.cardBody}>
              <p style={styles.code}>{p.code}</p>
              <p style={styles.price}>₵{p.price}</p>

              <select style={styles.select}>
                {p.sizes.map(s => <option key={s}>{s}</option>)}
              </select>

              <button style={styles.button}
                onClick={() => setSelected(p)}>
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <OrderModal product={selected} close={() => setSelected(null)} />
      )}

    </div>
  );
}


// ================= MODAL =================
function OrderModal({ product, close }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    size: "M",
    quantity: 1
  });

  const submit = async () => {
    if (!form.name || !form.phone || !form.location) {
      alert("Fill all fields");
      return;
    }

    await axios.post("http://localhost:5000/order", {
      ...form,
      product_code: product.code
    });

    alert("Order Received ✅");
    close();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h2>Order {product.code}</h2>

        <input placeholder="Full Name" style={styles.input}
          onChange={e => setForm({...form, name: e.target.value})} />

        <input placeholder="Phone" style={styles.input}
          onChange={e => setForm({...form, phone: e.target.value})} />

        <input placeholder="Location" style={styles.input}
          onChange={e => setForm({...form, location: e.target.value})} />

        <select style={styles.input}
          onChange={e => setForm({...form, size: e.target.value})}>
          {product.sizes.map(s => <option key={s}>{s}</option>)}
        </select>

        <input type="number" min="1" placeholder="Quantity"
          style={styles.input}
          onChange={e => setForm({...form, quantity: e.target.value})} />

        <button style={styles.button} onClick={submit}>
          Submit Order
        </button>

        <button onClick={close} style={{marginTop:10}}>Cancel</button>

      </div>
    </div>
  );
}


// ================= CSS (INSIDE JS) =================
const styles = {
  body: {
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Poppins, sans-serif"
  },

  logo: {
    textAlign: "center",
    marginBottom: "20px",
    letterSpacing: "2px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px"
  },

  card: {
    background: "#fff",
    color: "#000",
    borderRadius: "15px",
    overflow: "hidden"
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover"
  },

  cardBody: {
    padding: "10px"
  },

  code: {
    fontSize: "12px",
    color: "#555"
  },

  price: {
    fontWeight: "bold"
  },

  select: {
    width: "100%",
    marginTop: "5px",
    padding: "5px"
  },

  button: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#FF6B00",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  modal: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "400px"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "8px"
  }
};
