import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Pencil, Trash2, Save, X, ArrowLeft } from 'lucide-react';

function EditExamModal({ open, onClose, exam, onSave }) {
  const [form, setForm] = useState({ ...exam });
  const [asistenti, setAsistenti] = useState([]);
  const [sali, setSali] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ ...exam });
    setError('');
  }, [exam]);

  // Fetch asistenti when modal opens
  useEffect(() => {
    if (!open) return;
    fetch('http://localhost:8000/secretariat/api/asistenti', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAsistenti(data))
      .catch(console.error);
  }, [open]);
useEffect(() => {
  if (!open) return;
  fetch('http://localhost:8000/secretariat/api/sali', { credentials: 'include' })
    .then(r => r.json())
    .then(setSali)
    .catch(console.error);
}, [open]);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        data: form.data,
        id_sala: form.id_sala,
        id_asistent: form.id_asistent || null,
      };
      const res = await fetch(
        `http://localhost:8000/secretariat/api/examene/${exam.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
      <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600">
          <X size={20} />
        </button>
        <Dialog.Title className="text-xl font-bold mb-4">✏️ Editare Examen</Dialog.Title>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          {/* Data examen */}
          <label className="col-span-2">
            Data și ora
            <input
              name="data"
              type="datetime-local"
              value={form.data}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </label>
          {/* Sala */}
          <label className="col-span-2">
  Sala
  <select
    name="id_sala"
    value={form.id_sala || ''}
    onChange={handleChange}
    className="border p-2 rounded w-full"
  >
    <option value="">— Selectează sală —</option>
    {sali.map(s => (
      <option key={s.id} value={s.id}>
        {s.name} {s.buildingName && `(${s.buildingName})`}
      </option>
    ))}
  </select>
</label>
          {/* Asistent */}
          <label>
            Asistent
            <select
              name="id_asistent"
              value={form.id_asistent || ''}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">— fără asistent —</option>
              {asistenti.map(a => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </label>
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

export default function SecretariatExameneEdit() {
  const [examene, setExamene] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchList = async (statusFilter = ['trimisa', 'acceptata']) => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/secretariat/api/examene';
      const q = statusFilter.map(s => `status=${encodeURIComponent(s)}`).join('&');
      if (q) url += `?${q}`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      setExamene(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Ștergi acest examen?')) return;
    try {
      const res = await fetch(`http://localhost:8000/secretariat/api/examene/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      setExamene(examene.filter(e => e.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" size={20} /> Înapoi
      </button>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <h1 className="text-2xl font-bold mb-4">✏️ Gestionare Examene</h1>

      {loading ? (
        <p>Se încarcă examenele...</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Grupa</th>
              <th className="px-3 py-2">Disciplina</th>
              <th className="px-3 py-2">Sală</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Durata</th>
              <th className="px-3 py-2">Asistent</th>
              <th className="px-3 py-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {examene.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
  {e.disciplina.subgrupa.groupName}{e.disciplina.subgrupa.subgroupIndex}
</td>
                <td className="px-3 py-2">{e.disciplina.topic}</td>
                <td className="px-3 py-2">{e.sala?.name || '-'}</td>
                <td className="px-3 py-2">{new Date(e.data).toLocaleString('ro-RO')}</td>
                <td className="px-3 py-2">{e.durata}</td>
                <td className="px-3 py-2">{e.asistent ? `${e.asistent.firstName} ${e.asistent.lastName}` : '-'}</td>
                <td className="px-3 py-2 space-x-2 flex items-center">
                  <button onClick={() => { setSelectedExam(e); setModalOpen(true); }} className="text-blue-600 hover:underline flex items-center">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline flex items-center">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && selectedExam && (
        <EditExamModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          exam={selectedExam}
          onSave={updated => setExamene(examene.map(x => x.id === updated.id ? updated : x))}
        />
      )}
    </div>
  );
}
