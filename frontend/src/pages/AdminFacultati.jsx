import React, { useEffect, useState } from "react";
import { Trash2, Save, PlusCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminFacultati() {
  const [facultati, setFacultati] = useState([]);
  const [newFacultate, setNewFacultate] = useState({ longName: "", shortName: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/admin/facultati/json", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setFacultati(data))
      .catch(() => alert("Eroare încărcare facultăți"));
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch("http://localhost:8000/admin/facultati/update", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(() => {
        setMessage("Salvarea a fost realizată cu succes!");
        setTimeout(() => setMessage(""), 5000);
      })
      .catch(() => alert("Eroare salvare modificări"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi facultatea?")) return;

    const formData = new FormData();
    formData.append("id", id);

    fetch("http://localhost:8000/admin/facultati/delete", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(() => window.location.reload())
      .catch(() => alert("Eroare ștergere facultate"));
  };

  const handleAdd = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    fetch("http://localhost:8000/admin/facultati/add", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then(() => window.location.reload())
      .catch(() => alert("Eroare adăugare facultate"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 py-10">
      <div className="max-w-5xl mx-auto px-6">

        {/* Buton modern pentru inapoi */}
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center px-4 py-2 mb-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
        >
          <ArrowLeft className="mr-2" size={18} />
          Înapoi la pagina principală
        </button>

        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          <PlusCircle className="inline-block mr-2" /> Adaugă facultate nouă
        </h3>
        <form onSubmit={handleAdd} className="bg-white rounded shadow-lg p-6">
          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Nume facultate:</span>
            <input
              className="border rounded p-2 w-full mt-1"
              type="text"
              name="longName"
              placeholder="Facultatea de Informatică"
              required
              value={newFacultate.longName}
              onChange={(e) => setNewFacultate({ ...newFacultate, longName: e.target.value })}
            />
          </label>
          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Abreviere:</span>
            <input
              className="border rounded p-2 w-full mt-1"
              type="text"
              name="shortName"
              placeholder="FIESC"
              required
              value={newFacultate.shortName}
              onChange={(e) => setNewFacultate({ ...newFacultate, shortName: e.target.value })}
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center"
          >
            <PlusCircle className="mr-2" /> Adaugă facultate
          </button>
        </form>

        <hr className="my-8" />

        <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Administrare Facultăți</h2>

        <form id="adminFacultatiForm" onSubmit={handleUpdate}>
          <table className="w-full text-left bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nume</th>
                <th className="px-4 py-3">Abreviere</th>
                <th className="px-4 py-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {facultati.map((f) => (
                <tr key={f.id} className="border-b hover:bg-teal-50">
                  <td className="px-4 py-3">{f.id}</td>
                  <td className="px-4 py-3">
                    <input
                      className="border p-2 rounded w-full"
                      type="text"
                      name={`nume_${f.id}`}
                      defaultValue={f.longName}
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="border p-2 rounded w-full"
                      type="text"
                      name={`short_${f.id}`}
                      defaultValue={f.shortName}
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="fixed bottom-6 right-6 z-50">
            <button
              type="submit"
              form="adminFacultatiForm"
              className="flex items-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition duration-300"
            >
              <Save className="mr-2" size={20} />
              Salvează modificările
            </button>
          </div>
        </form>

        {message && (
          <div className="fixed bottom-20 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-md transition-opacity">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
