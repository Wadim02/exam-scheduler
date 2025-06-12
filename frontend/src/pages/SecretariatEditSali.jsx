import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Pencil, Trash2, Save, X , ArrowLeft,LogOut} from 'lucide-react';
import { useNavigate } from "react-router-dom";

function SalaEditModal({ open, onClose, sala, onSave }) {
  const [form, setForm] = useState({ ...sala });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  useEffect(() => {
    setForm({ ...sala });
    setError('');
  }, [sala]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/secretariat/api/sali/${sala.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600">
          <X size={20} />
        </button>
        <Dialog.Title className="text-xl font-bold mb-4">✏️ Editare sală</Dialog.Title>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="grid gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Name"
          />
          <input
            name="shortName"
            value={form.shortName}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Short Name"
          />
          <input
            name="buildingName"
            value={form.buildingName}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Building Name"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Save className="mr-2" size={18} /> {loading ? 'Salvez...' : 'Salvează'}
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}

export default function SecretariatEditSali() {
  const navigate = useNavigate();
  const [sali, setSali] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSala, setSelectedSala] = useState(null);
  const [message, setMessage] = useState(null);
  const [newRoom, setNewRoom] = useState({ name: '', shortName: '', buildingName: '' });
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 50;
  const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };

  // Încarcă săli odată la montare
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/secretariat/api/sali', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Eroare la încărcare săli');
        const data = await res.json();
        setSali(data);
      } catch (err) {
        showMessage(err.message, 'error');
      }
    })();
  }, []);

  // Mesaje temporare
  function showMessage(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  // Adaugă sală nouă
  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/secretariat/api/sali', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setSali([created, ...sali]);
      setNewRoom({ name: '', shortName: '', buildingName: '' });
      showMessage('Sală adăugată cu succes');
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ștergere sală
  const handleDelete = async id => {
    if (!window.confirm('Sigur ştergi această sală?')) return;
    try {
      const res = await fetch(`http://localhost:8000/secretariat/api/sali/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Eroare la ștergere');
      setSali(sali.filter(s => s.id !== id));
      showMessage('Sală ștearsă cu succes');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  // Salvare din modal
  const handleSave = updated => {
    setSali(sali.map(s => (s.id === updated.id ? updated : s)));
    showMessage('Sală actualizată cu succes');
  };

  // Filtrare cu protecție optional chaining
  const filtered = sali.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.shortName?.toLowerCase().includes(q) ||
      s.buildingName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 py-10">
    <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} /> Deconectare
      </button>
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
      <button
  onClick={() => window.history.back()}
  className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
>
  <ArrowLeft className="mr-2" size={20} /> Înapoi
</button>
      {message && (
        <div className={`mb-4 p-3 rounded shadow text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">📋 Gestionare Săli</h1>

      {/* Add new room */}
      <div className="mb-6">
        <h2 className="font-semibold">Adaugă sală nouă</h2>
        <div className="flex space-x-2 mt-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="Name"
            value={newRoom.name}
            onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Short Name"
            value={newRoom.shortName}
            onChange={e => setNewRoom({ ...newRoom, shortName: e.target.value })}
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Building"
            value={newRoom.buildingName}
            onChange={e => setNewRoom({ ...newRoom, buildingName: e.target.value })}
          />
          <button
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            onClick={handleAdd}
            disabled={loading}
          >
            + Adaugă
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Caută după name, shortName sau building..."
        className="w-full mb-4 p-2 border rounded"
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
      />

      {/* Table */}
      <table className="w-full table-auto border-collapse bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Short Name</th>
            <th className="px-4 py-2">Building</th>
            <th className="px-4 py-2">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {current.map(s => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{s.id}</td>
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.shortName}</td>
              <td className="px-4 py-2">{s.buildingName}</td>
              <td className="px-4 py-2 space-x-2 flex">
                <button
                  onClick={() => { setSelectedSala(s); setModalOpen(true); }}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Editează"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Șterge"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          ⬅️ Anterior
        </button>
        <span>Pagina {currentPage} din {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Următor ➡️
        </button>
      </div>

      {/* Modal edit */}
      {modalOpen && selectedSala && (
        <SalaEditModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sala={selectedSala}
          onSave={handleSave}
        />
      )}
    </div>
    </div>
  );
}
