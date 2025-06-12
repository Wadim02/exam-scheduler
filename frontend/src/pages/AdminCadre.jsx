import React, { useEffect, useState, useCallback } from "react";
import { Trash2, PlusCircle, ArrowLeft, Pencil,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminCadruEditModal from "./AdminCadruEditModal";

export default function AdminCadre() {
  const [cadre, setCadre] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCadru, setSelectedCadru] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [searchQuery, setSearchQuery] = useState("");
  const [newCadru, setNewCadru] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    facultyName: "",
    departmentName: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const filteredCadre = cadre.filter((c) => {
  const search = searchQuery.toLowerCase();
  return (
    c.firstName.toLowerCase().includes(search) ||
    c.lastName.toLowerCase().includes(search) ||
    c.emailAddress.toLowerCase().includes(search)
  );
});

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentCadre = filteredCadre.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.max(1, Math.ceil(filteredCadre.length / itemsPerPage));
  const navigate = useNavigate();
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  const loadCadre = useCallback(() => {
    fetch("http://localhost:8000/api/admin/cadre", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare încărcare cadre didactice");
        return res.json();
      })
      .then((data) => setCadre(data))
      .catch(() => showMessage("Eroare încărcare cadre didactice", "error"));
  }, []);

  useEffect(() => {
    loadCadre();
  }, [loadCadre]);

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdd = (e) => {
    e.preventDefault();

    if (
      !newCadru.firstName.trim() ||
      !newCadru.lastName.trim() ||
      !newCadru.emailAddress.trim() ||
      !newCadru.facultyName.trim() ||
      !newCadru.departmentName.trim()
    ) {
      showMessage("Completează toate câmpurile obligatorii!", "error");
      return;
    }
    if (!validateEmail(newCadru.emailAddress)) {
      showMessage("Email invalid!", "error");
      return;
    }
    if (!newCadru.emailAddress.endsWith("@usm.ro")) {
      showMessage("Emailul trebuie să se termine în '@usm.ro'", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    for (let key in newCadru) {
      formData.append(key, newCadru[key].trim());
    }

    fetch("http://localhost:8000/admin/adauga-cadru", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          let errorText = "Eroare adăugare cadru didactic";
          try {
            const errorData = await res.json();
            if (errorData.detail) errorText = errorData.detail;
          } catch {}
          throw new Error(errorText);
        }
        showMessage("Cadru didactic adăugat cu succes!");
        setNewCadru({
          firstName: "",
          lastName: "",
          emailAddress: "",
          phoneNumber: "",
          facultyName: "",
          departmentName: "",
        });
        loadCadre();
      })
      .catch((err) => showMessage(err.message, "error"))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Sigur dorești să ștergi acest cadru didactic?")) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("id", id);
    fetch(`http://localhost:8000/admin/cadre/delete/${id}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare ștergere");
        showMessage("Cadru didactic șters cu succes!");
        loadCadre();
      })
      .catch(() => showMessage("Eroare ștergere cadru didactic", "error"))
      .finally(() => setLoading(false));
  };

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
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 ${
            message.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            {message.text}
          </div>
        )}

        
        <div className="mb-6">
  <input
    type="text"
    placeholder="🔍 Caută după nume sau email..."
    className="w-full p-3 border rounded shadow"
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Resetează la pagina 1 când faci o căutare
    }}
  />
</div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="mr-2" /> Adaugă Cadru Didactic
        </h3>

        <form onSubmit={handleAdd} className="bg-white rounded shadow-lg p-6 mb-10 grid gap-4">
          {["firstName", "lastName", "emailAddress", "phoneNumber", "facultyName", "departmentName"].map((field, index) => (
            <input
              key={index}
              type={field === "emailAddress" ? "email" : "text"}
              name={field}
              placeholder={field === "emailAddress" ? "Email (@usm.ro)" : field}
              required={["firstName", "lastName", "emailAddress", "facultyName", "departmentName"].includes(field)}
              className="border rounded p-2"
              value={newCadru[field]}
              onChange={(e) => setNewCadru({ ...newCadru, [field]: e.target.value })}
              disabled={loading}
            />
          ))}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center justify-center"
          >
            <PlusCircle className="mr-2" /> Adaugă
          </button>
        </form>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">📋 Editare Cadre Didactice (@usm.ro)</h2>

        <table className="w-full text-left bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-4 py-3">Prenume</th>
              <th className="px-4 py-3">Nume</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Facultate</th>
              <th className="px-4 py-3">Departament</th>
              <th className="px-4 py-3">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {currentCadre.map((c) => (
              
              <tr key={c.id} className="border-b hover:bg-teal-50">
                <td className="px-4 py-3">{c.firstName}</td>
                <td className="px-4 py-3">{c.lastName}</td>
                <td className="px-4 py-3">{c.emailAddress}</td>
                <td className="px-4 py-3">{c.phoneNumber}</td>
                <td className="px-4 py-3">{c.facultyName}</td>
                <td className="px-4 py-3">{c.departmentName}</td>
                <td className="px-4 py-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCadru(c);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    title="Editează"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                    title="Șterge"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
          </tbody>
        </table>
<div className="flex justify-between items-center mt-6">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => prev - 1)}
    className={`px-4 py-2 rounded ${
      currentPage === 1 ? "bg-gray-300 text-gray-500" : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
  >
    ⬅️ Pagina anterioară
  </button>

  <span className="text-gray-700 font-medium">
    Pagina {currentPage} din {totalPages}
  </span>

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((prev) => prev + 1)}
    className={`px-4 py-2 rounded ${
      currentPage === totalPages ? "bg-gray-300 text-gray-500" : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
  >
    Pagina următoare ➡️
  </button>
</div>
        {/* MODAL */}
        {modalOpen && selectedCadru && (
          <AdminCadruEditModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            cadru={selectedCadru}
            onSave={loadCadre}
          />
        )}
      </div>
    </div>
  );
}
