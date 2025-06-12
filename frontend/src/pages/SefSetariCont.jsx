// SefSetariCont.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SefSetariCont() {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/me`, { withCredentials: true })
      .then(({ data }) => {
        setForm({
          first_name: data.first_name || "",
          last_name:  data.last_name  || "",
          phone_number: data.phone_number || "",  // ajustează dacă backend folosește alt key
          email: data.email
        });
      })
      .catch(err => {
        console.error("Failed fetching profile", err);
        setMsg("Eroare la încărcarea datelor.");
      })
      .finally(() => setLoading(false));
  }, [API]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      // nu trimitem email-ul la update
      const { email, ...payload } = form;
      const resp = await axios.put(
        `${API}/sefgrupa/update`,
        payload,
        { withCredentials: true }
      );
      setMsg(resp.data.message || "Actualizat cu succes!");
    } catch (err) {
      console.error("Update error", err);
      setMsg(err.response?.data?.detail || "Eroare la actualizare.");
    }
  };

  if (loading) return <p>Se încarcă setările contului…</p>;

  return (
  <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 py-10 px-6">
          <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <button
        onClick={() => navigate('/sefgrupa')}
        className="mb-6 flex items-center"
      >
        <ArrowLeft className="mr-2" /> Înapoi
      </button>
      <h2 className="text-2xl mb-4">Setări cont Șef Grupa</h2>
      {msg && (
        <div className={`mb-3 p-2 rounded ${msg.startsWith("Eroare") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {msg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">Prenume</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Nume</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Telefon</label>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Salvează
        </button>
      </form>
    </div>
  </div>
  );
}
