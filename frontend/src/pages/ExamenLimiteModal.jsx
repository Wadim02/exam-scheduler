import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { X, Save } from 'lucide-react';

// Fă importul ăsta O SINGURĂ DATĂ în index.js sau App.js:
// import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

export default function ExamenLimiteModal({ isOpen, onRequestClose }) {
  const [start, setStart] = useState(null);
  const [end, setEnd]   = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    fetch('http://localhost:8000/secretariat/limite-examene/json', {
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
})
      .then(res => res.json())
      .then(data => {
        if (data.data_inceput) setStart(new Date(data.data_inceput));
        if (data.data_sfarsit) setEnd(new Date(data.data_sfarsit));
      })
      .catch(() => setError('Nu am putut încărca limitele.'));
  }, [isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!start || !end || start >= end) {
      setError('Alege corect data de început și sfârșit.');
      return;
    }
    const body = new URLSearchParams();
    body.append('data_inceput', start.toISOString());
    body.append('data_sfarsit', end.toISOString());

    fetch('http://localhost:8000/secretariat/limite-examene', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setSuccess('Limitele au fost salvate cu succes!');
      setTimeout(() => {
       onRequestClose();
       setSuccess('');
     }, 1500);
      
    })
    .catch(() => setError('Eroare la salvarea limitelor.'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="fixed inset-0 bg-black/20 flex items-center justify-center"
      className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto relative"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
      >
        <X size={20} />
      </button>
      <h2 className="text-2xl font-bold mb-4">Configurează perioadele</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Data început:</label>
          <DatePicker
            selected={start}
            onChange={setStart}
            showTimeSelect
            dateFormat="Pp"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Data sfârșit:</label>
          <DatePicker
            selected={end}
            onChange={setEnd}
            showTimeSelect
            dateFormat="Pp"
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          <Save className="mr-2" /> Salvează
        </button>
      </form>
    </Modal>
  );
}
