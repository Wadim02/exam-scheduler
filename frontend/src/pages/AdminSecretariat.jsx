import React, { useEffect, useState, useCallback } from "react";
import { Trash2, Save, PlusCircle, ArrowLeft,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSecretariat() {
  const [secretari, setSecretari] = useState([]);
  const [newSecretar, setNewSecretar] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    facultyName: "",
    departmentName: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadSecretari = useCallback(() => {
    fetch("http://localhost:8000/admin/secretariat/json", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSecretari(data))
      .catch(() => showMessage("Eroare încărcare secretari", "error"));
  }, []);

  useEffect(() => {
    loadSecretari();
  }, [loadSecretari]);

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdd = (e) => {
    e.preventDefault();
    if (
      !newSecretar.firstName.trim() ||
      !newSecretar.lastName.trim() ||
      !newSecretar.emailAddress.trim() ||
      !newSecretar.facultyName.trim() ||
      !newSecretar.departmentName.trim()
    ) {
      showMessage("Completează toate câmpurile!", "error");
      return;
    }
    if (!validateEmail(newSecretar.emailAddress)) {
      showMessage("Email invalid!", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    for (let key in newSecretar) {
      formData.append(key, newSecretar[key].trim());
    }

    fetch("http://localhost:8000/admin/secretariat/add", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare adăugare");
        showMessage("Secretar adăugat cu succes!");
        setNewSecretar({ firstName: "", lastName: "", emailAddress: "", facultyName: "", departmentName: "" });
        loadSecretari();
      })
      .catch(() => showMessage("Eroare adăugare secretar", "error"))
      .finally(() => setLoading(false));
  };
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  const handleDelete = (id) => {
    if (!window.confirm("Sigur dorești să ștergi acest secretar?")) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("id", id);
    fetch("http://localhost:8000/admin/secretariat/delete", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare ștergere");
        showMessage("Secretar șters cu succes!");
        loadSecretari();
      })
      .catch(() => showMessage("Eroare ștergere secretar", "error"))
      .finally(() => setLoading(false));
  };

  function SecretarRow({ s }) {
    const [rowData, setRowData] = useState({ ...s });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setRowData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      if (
        !rowData.firstName.trim() ||
        !rowData.lastName.trim() ||
        !rowData.emailAddress.trim() ||
        !rowData.facultyName.trim() ||
        !rowData.departmentName.trim()
      ) {
        showMessage("Toate câmpurile sunt obligatorii!", "error");
        return;
      }

      const formData = new FormData();
      formData.append("id", s.id);
      for (let key in rowData) {
        formData.append(key, String(rowData[key] || "").trim());
      }

      setSaving(true);
      try {
        const res = await fetch("http://localhost:8000/admin/secretariat/update", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!res.ok) throw new Error("Eroare la salvare");
        showMessage("Modificare salvată cu succes!");
        loadSecretari();
      } catch {
        showMessage("Eroare la salvare", "error");
      } finally {
        setSaving(false);
      }
    };

    return (
      <tr className="border-b hover:bg-teal-50">
        <td className="px-4 py-3">
          <input className="border p-2 rounded w-full" type="text" name="firstName" value={rowData.firstName} onChange={handleChange} disabled={saving} />
        </td>
        <td className="px-4 py-3">
          <input className="border p-2 rounded w-full" type="text" name="lastName" value={rowData.lastName} onChange={handleChange} disabled={saving} />
        </td>
        <td className="px-4 py-3">
          <input className="border p-2 rounded w-full" type="email" name="emailAddress" value={rowData.emailAddress} onChange={handleChange} disabled={saving} />
        </td>
        <td className="px-4 py-3">
          <input className="border p-2 rounded w-full" type="text" name="facultyName" value={rowData.facultyName} onChange={handleChange} disabled={saving} />
        </td>
        <td className="px-4 py-3">
          <input className="border p-2 rounded w-full" type="text" name="departmentName" value={rowData.departmentName} onChange={handleChange} disabled={saving} />
        </td>
        <td className="px-4 py-3 flex space-x-2">
          <button onClick={handleSave} disabled={saving} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded" title="Salvează">
            <Save size={16} />
          </button>
          <button onClick={() => handleDelete(s.id)} disabled={saving} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded" title="Șterge">
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 py-10">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} /> Deconectare
      </button>
      <div className="max-w-6xl mx-auto px-6 relative">
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 flex items-center "
        >
          <ArrowLeft className="mr-2" size={20} /> Înapoi
        </button>

        {message && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 ${message.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {message.text}
          </div>
        )}

        <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="mr-2" /> Adaugă Secretar
        </h3>

        <form onSubmit={handleAdd} className="bg-white rounded shadow-lg p-6 mb-10 grid gap-4">
          <input type="text" name="firstName" placeholder="Prenume" required className="border rounded p-2" value={newSecretar.firstName} onChange={(e) => setNewSecretar({ ...newSecretar, firstName: e.target.value })} disabled={loading} />
          <input type="text" name="lastName" placeholder="Nume" required className="border rounded p-2" value={newSecretar.lastName} onChange={(e) => setNewSecretar({ ...newSecretar, lastName: e.target.value })} disabled={loading} />
          <input type="email" name="emailAddress" placeholder="Email" required className="border rounded p-2" value={newSecretar.emailAddress} onChange={(e) => setNewSecretar({ ...newSecretar, emailAddress: e.target.value })} disabled={loading} />
          <input type="text" name="facultyName" placeholder="Facultate" required className="border rounded p-2" value={newSecretar.facultyName} onChange={(e) => setNewSecretar({ ...newSecretar, facultyName: e.target.value })} disabled={loading} />
          <input type="text" name="departmentName" placeholder="Departament" required className="border rounded p-2" value={newSecretar.departmentName} onChange={(e) => setNewSecretar({ ...newSecretar, departmentName: e.target.value })} disabled={loading} />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center justify-center">
            <PlusCircle className="mr-2" /> Adaugă
          </button>
        </form>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">📋 Editare Secretari</h2>

        <table className="w-full text-left bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-4 py-3">Prenume</th>
              <th className="px-4 py-3">Nume</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Facultate</th>
              <th className="px-4 py-3">Departament</th>
              <th className="px-4 py-3">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {secretari.map((s) => (
              <SecretarRow key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
