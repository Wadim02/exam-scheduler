import React, { useState } from 'react';
import {  ArrowLeft } from 'lucide-react';

export default function SecretariatDiscipline() {
  const [genProgress, setGenProgress] = useState(0);
  const [impProgress, setImpProgress] = useState(0);
  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingImp, setLoadingImp] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const [impMessage, setImpMessage] = useState('');

  // Trigger generation of disciplines
  const handleGenerate = async () => {
    setLoadingGen(true);
    setGenProgress(0);
    setGenMessage('');
    try {
      const res = await fetch('/secretariat/discipline/genereaza', { method: 'POST' });
      if (!res.ok) throw new Error('Eroare generare');
      const result = await res.json();

      // Simulare progres
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 20, 100);
        setGenProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setLoadingGen(false);
          setGenMessage(result.message || 'Generat cu succes');
        }
      }, 300);
    } catch (err) {
      console.error(err);
      setLoadingGen(false);
      setGenMessage('Eroare la generare');
    }
  };

  // Trigger import of disciplines from CSV on server
  const handleImport = async () => {
    setLoadingImp(true);
    setImpProgress(0);
    setImpMessage('');
    try {
      const res = await fetch('/secretariat/import-discipline-csv', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Eroare import');
      }
      const result = await res.json();

      // Simulare progres
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 25, 100);
        setImpProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setLoadingImp(false);
          setImpMessage(result.message || 'Importat cu succes');
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setLoadingImp(false);
      setImpMessage('Eroare la import');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
            <button onClick={() => window.history.back()} className="mb-4 flex items-center text-gray-700 hover:text-gray-900">
        <ArrowLeft className="mr-2" size={20}/> Înapoi
      </button>
      <h1 className="text-2xl font-bold mb-6">Gestionare Discipline</h1>
      <div className="space-y-6">
        <div>
          <button
            onClick={handleGenerate}
            disabled={loadingGen}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Generează discipline
          </button>
          {loadingGen && (
            <div className="mt-2">
              <progress value={genProgress} max="100" className="w-full" />
              <div className="text-right text-sm text-gray-600 mt-1">{genProgress}%</div>
            </div>
          )}
          {genMessage && !loadingGen && (
            <p className="mt-2 text-green-600">{genMessage}</p>
          )}
        </div>
        <div>
          <button
            onClick={handleImport}
            disabled={loadingImp}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Importă discipline
          </button>
          {loadingImp && (
            <div className="mt-2">
              <progress value={impProgress} max="100" className="w-full" />
              <div className="text-right text-sm text-gray-600 mt-1">{impProgress}%</div>
            </div>
          )}
          {impMessage && !loadingImp && (
            <p className="mt-2 text-blue-600">{impMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
