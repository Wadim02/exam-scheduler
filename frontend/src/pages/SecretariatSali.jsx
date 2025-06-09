import React, { useState } from 'react';
import { ArrowLeft} from 'lucide-react';

export default function SecretariatSali() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const downloadRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/secretariat/descopera-sali', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Eroare la descărcare');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sali.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

const performImport = async (force = false) => {
    const endpoint =
      'http://localhost:8000/secretariat/incarca-sali' +
      (force ? '?force=true' : '');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',              // trimite cookie-urile de sesiune
      body: formData,                      // multipart/form-data
    });

    if (res.ok) {
      return res.json();                   // { imported: N }
    } else {
      
      let err;
      try {
        err = await res.json();
      } catch {
        throw new Error(res.statusText);
      }
      throw err;
    }
  };

  const importRooms = async (e) => {
    e.preventDefault();
    if (!file) {
      setImportMessage('Selectează un fișier înainte.');
      return;
    }
    setImporting(true);
    setImportMessage('');
    try {
      const data = await performImport();
      setImportMessage(`✔ Import reușit! ${data.imported || ''}`);
    } catch (err) {
      if (err.detail && err.detail.includes('ForeignKeyViolation')) {
        const confirm = window.confirm(
          'Doriți să încărcați sălile în baza de date?\nDacă da, se vor șterge programările deja propuse.'
        );
        if (confirm) {
          try {
            const data = await performImport(true);
            setImportMessage(`✔ Import forțat reușit! ${data.imported || ''}`);
          } catch (innerErr) {
            setImportMessage(`❌ ${innerErr.detail || innerErr.message}`);
          }
        } else {
          setImportMessage('Import anulat de utilizator.');
        }
      } else {
        setImportMessage(`❌ ${err.detail || err.message}`);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
  onClick={() => window.history.back()}
  className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
>
  <ArrowLeft className="mr-2" size={20} /> Înapoi
</button>
      <h1 className="text-3xl font-bold">Gestionare Săli</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={downloadRooms}
        disabled={loading}
      >
        📥 {loading ? 'Se descarcă...' : 'Descarcă sălile'}
      </button>
      {loading && (
        <div className="text-green-600">
          <p>Se generează fișierul. Așteaptă.</p>
        </div>
      )}

      <form onSubmit={importRooms} className="space-y-2 mt-4">
        <label className="block">
          <span className="text-sm">Încarcă fișier .xlsx:</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="block mt-1"
          />
        </label>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={importing}
        >
          🚀 {importing ? 'Se importă...' : 'Importă sălile'}
        </button>
        {importMessage && <div className="text-sm mt-1">{importMessage}</div>}
      </form>

      <button
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 mt-6"
        onClick={() => (window.location.href = '/secretariat/saliedit')}
      >
        👁️ Vizualizează și editează sălile
      </button>
    </div>
  );
}
