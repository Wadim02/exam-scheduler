// src/pages/SecretariatEditSefGrupa.jsx

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Pencil, Trash2, Save, X, ArrowLeft ,LogOut} from 'lucide-react';
import { useNavigate } from "react-router-dom";

function SefGrupaEditModal({ open, onClose, sef, onSave }) {
  const [form, setForm] = useState({ ...sef });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ ...sef });
    setError('');
  }, [sef]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/secretariat/api/sefi/${sef.id}`,
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
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600">
          <X size={20} />
        </button>
        <Dialog.Title className="text-xl font-bold mb-4">✏️ Editare Șef de grupă</Dialog.Title>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Nume"
            className="border p-2 rounded"
          />
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Prenume"
            className="border p-2 rounded"
          />
          <input
            name="emailAddress"
            value={form.emailAddress}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded col-span-2"
          />
          <input
            name="phoneNumber"
            value={form.phoneNumber || ''}
            onChange={handleChange}
            placeholder="Telefon"
            className="border p-2 rounded col-span-2"
          />
          <input
            name="subgroup"
            value={`${form.studyYear} - ${form.groupName}${form.subgroupIndex}`}
            disabled
            className="border p-2 rounded col-span-2 bg-gray-100"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Save className="mr-2" size={18} /> {loading ? 'Salvez...' : 'Salvează'}
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}

export default function SecretariatEditSefGrupa() {
  const navigate = useNavigate();
  const [sefi, setSefi] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const itemsPerPage = 50;
  const [newSef, setNewSef] = useState({
    lastName: '',
    firstName: '',
    emailAddress: '',
    phoneNumber: '',
    id_subgrupe: ''
  });
  const [subgrupe, setSubgrupe] = useState([]);

  // load all group leaders for this secretariat’s faculty
  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('http://localhost:8000/secretariat/api/sefi', { credentials: 'include' }),
          fetch('http://localhost:8000/secretariat/api/subgrupe', { credentials: 'include' })
        ]);
        if (!r1.ok) throw new Error('Eroare la încărcare șefi');
        if (!r2.ok) throw new Error('Eroare la încărcare subgrupe');
        setSefi(await r1.json());
        setSubgrupe(await r2.json());
      } catch (err) {
        showMessage(err.message, 'error');
      }
    })();
  }, []);

  function showMessage(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }
  const handleCreate = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/secretariat/api/sefi', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSef),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setSefi([created, ...sefi]);
      setNewSef({ lastName:'', firstName:'', emailAddress:'', phoneNumber:'', id_subgrupe:'' });
      showMessage('Șef de grupă adăugat cu succes');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  

  const handleDelete = async id => {
    if (!window.confirm('Sigur ştergi acest șef de grupă?')) return;
    try {
      const res = await fetch(`http://localhost:8000/secretariat/api/sefi/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Eroare la ștergere');
      setSefi(sefi.filter(s => s.id !== id));
      showMessage('Șef de grupă șters cu succes');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleSave = updated => {
    setSefi(sefi.map(s => (s.id === updated.id ? { ...s, ...updated } : s)));
    showMessage('Șef de grupă actualizat cu succes');
  };

  // filtering
  const filtered = sefi.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.lastName?.toLowerCase().includes(q) ||
      s.firstName?.toLowerCase().includes(q) ||
      s.emailAddress?.toLowerCase().includes(q)
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
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      {/* Înapoi */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" size={20} /> Înapoi
      </button>

      {message && (
        <div className={`mb-4 p-3 rounded text-white ${message.type==='success'?'bg-green-600':'bg-red-600'}`}>
          {message.text}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">👥 Gestionare Șefi de grupă</h1>
{/* ――― Formular inline pentru adăugare ――― */}
      <form onSubmit={handleCreate} className="grid grid-cols-6 gap-2 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Nume"
          value={newSef.lastName}
          onChange={e => setNewSef({ ...newSef, lastName: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Prenume"
          value={newSef.firstName}
          onChange={e => setNewSef({ ...newSef, firstName: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          type="email"
          value={newSef.emailAddress}
          onChange={e => setNewSef({ ...newSef, emailAddress: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Telefon"
          value={newSef.phoneNumber}
          onChange={e => setNewSef({ ...newSef, phoneNumber: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={newSef.id_subgrupe}
          onChange={e => setNewSef({ ...newSef, id_subgrupe: e.target.value })}
          required
        >
          <option value="">Selectează subgrupă</option>
          {subgrupe.map(sg => (
            <option key={sg.id} value={sg.id}>
              {sg.studyYear} – {sg.groupName}{sg.subgroupIndex}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          + Adaugă șef de grupă
        </button>
      </form>
      <div className="mb-4">
  <input
    type="text"
    placeholder="🔍 Caută după nume, prenume sau email..."
    className="w-full p-2 border rounded"
    value={searchQuery}
    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
  />
</div>

      <table className="w-full table-auto border-collapse bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nume</th>
            <th className="px-4 py-2">Prenume</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Telefon</th>
            <th className="px-4 py-2">Subgrupă</th>
            <th className="px-4 py-2">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {current.map(s => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{s.id}</td>
              <td className="px-4 py-2">{s.lastName}</td>
              <td className="px-4 py-2">{s.firstName}</td>
              <td className="px-4 py-2">{s.emailAddress}</td>
              <td className="px-4 py-2">{s.phoneNumber}</td>
              <td className="px-4 py-2">{s.studyYear} - {s.groupName}{s.subgroupIndex}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => { setSelected(s); setModalOpen(true); }}
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
          disabled={currentPage===1}
          onClick={() => setCurrentPage(p=>p-1)}
          className={`px-4 py-2 rounded ${currentPage===1?'bg-gray-300 text-gray-500':'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          ⬅️ Anterior
        </button>
        <span>Pagina {currentPage} din {totalPages}</span>
        <button
          disabled={currentPage===totalPages}
          onClick={() => setCurrentPage(p=>p+1)}
          className={`px-4 py-2 rounded ${currentPage===totalPages?'bg-gray-300 text-gray-500':'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Următor ➡️
        </button>
      </div>

      {/* Edit Modal */}
      {modalOpen && selected && (
        <SefGrupaEditModal
          open={modalOpen}
          onClose={()=>setModalOpen(false)}
          sef={selected}
          onSave={handleSave}
        />
      )}
    </div>
  </div>
);
}
