import React, { useState } from 'react';
import { ArrowLeft} from 'lucide-react';

export default function SecretariatImportSefGrupa() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleImport = async (e, force = false) => {
    e && e.preventDefault();
    if (!file) {
      setMessage({ text: 'Selectează un fișier .xlsx înainte.', type: 'error' });
      return;
    }
    setImporting(true);
    setMessage(null);

    try {
      // construim URL-ul cu force param dacă e cazul
      const url = new URL('http://localhost:8000/secretariat/import-sefi-csv');
      if (force) url.searchParams.set('force', 'true');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        // încercăm să citim JSON-ul de eroare
        const err = await res.json().catch(() => ({}));
        const detail = err.detail || res.statusText;

        // dacă e FK violation, întrebăm utilizatorul
        if (res.status === 409 && detail === 'ForeignKeyViolation') {
          const ok = window.confirm(
            'Există programări de examene legate de unii șefi.\n' +
            'Dorești să ștergi mai întâi propunerile de examene și să continui importul?'
          );
          if (ok) {
            // reapelează cu force=true
            await handleImport(null, true);
            return;
          } else {
            setMessage({ text: 'Import anulat de utilizator.', type: 'error' });
            return;
          }
        }

        throw new Error(detail);
      }

      const data = await res.json();
      setMessage({ text: ` ${data.message}`, type: 'success' });
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
            <button
  onClick={() => window.history.back()}
  className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
>
  <ArrowLeft className="mr-2" size={20} /> Înapoi
</button>
      <h1 className="text-2xl font-bold">📥 Încarcă fișier Excel cu șefii de grupă</h1>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleImport} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Fișier .xlsx:</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={e => setFile(e.target.files[0])}
            className="mt-1 block w-full"
            required
          />
        </label>
        <button
          type="submit"
          disabled={importing}
          className={`px-4 py-2 rounded text-white ${
            importing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {importing ? 'Se importă...' : 'Importă șefi de grupă'}
        </button>
      </form>

      <button
        onClick={() => (window.location.href = '/secretariat/sefgrupeedit')}
        className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        👥 Editează șefi de grupă
      </button>
    </div>
  );
}
