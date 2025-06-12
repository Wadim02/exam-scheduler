import React, { useEffect, useState } from "react";
import { Save, ArrowLeft,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSetari() {
  const [profil, setProfil] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    facultyName: "",
    departmentName: "",
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  useEffect(() => {
    fetch("http://localhost:8000/admin/profil", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare încărcare profil");
        return res.json();
      })
      .then((data) => {
        setProfil(data);
        setFormData(data);
      })
      .catch(() => showMessage("Eroare încărcare profil", "error"));
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.facultyName.trim() ||
      !formData.departmentName.trim()
    ) {
      showMessage("Completează toate câmpurile!", "error");
      return;
    }

    const fd = new FormData();
    fd.append("id", profil.id);
    fd.append("firstName", formData.firstName.trim());
    fd.append("lastName", formData.lastName.trim());
    fd.append("facultyName", formData.facultyName.trim());
    fd.append("departmentName", formData.departmentName.trim());

    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/admin/profil/update", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Eroare salvare");
      showMessage("Modificări salvate cu succes!");
    } catch {
      showMessage("Eroare la salvare", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!profil) return <div className="text-center mt-20">Se încarcă datele...</div>;

  return (
    <div className="min-h-screen py-10 bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} /> Deconectare
      </button>
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
           <button
          onClick={() => navigate("/admin")}
          className="mb-4 flex items-center "
        >
          <ArrowLeft className="mr-2" size={20} /> Înapoi
        </button>
        {message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow text-white z-50 ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        

        <h2 className="text-2xl font-bold text-gray-700 mb-4">🔧 Setări cont administrator</h2>

        <div className="grid gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="Prenume"
            className="border rounded p-2"
            value={formData.firstName}
            onChange={handleChange}
            disabled={saving}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Nume"
            className="border rounded p-2"
            value={formData.lastName}
            onChange={handleChange}
            disabled={saving}
          />
          <input
            type="email"
            name="emailAddress"
            placeholder="Email"
            className="border rounded p-2 bg-gray-100 cursor-not-allowed"
            value={formData.emailAddress}
            readOnly
          />
          <input
            type="text"
            name="facultyName"
            placeholder="Facultate"
            className="border rounded p-2"
            value={formData.facultyName}
            onChange={handleChange}
            disabled={saving}
          />
          <input
            type="text"
            name="departmentName"
            placeholder="Departament"
            className="border rounded p-2"
            value={formData.departmentName}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
        >
          <Save className="mr-2" size={18} />
          {saving ? "Salvez..." : "Salvează modificările"}
        </button>
      </div>
    </div>
  );
}
