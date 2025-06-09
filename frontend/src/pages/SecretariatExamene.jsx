import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, List, Download } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

export default function SecretariatExameneDashboard() {
  const navigate = useNavigate();


  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" size={20} /> Înapoi
      </button>
      <h1 className="text-2xl font-bold text-center mb-6">Gestionare Examene</h1>
      <button
        onClick={() => navigate('/secretariat/examene/editare')}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
      >
        <Pencil size={20} />
        <span>Editare Examene</span>
      </button>

      <button
        onClick={() => navigate('/secretariat/examene/situatie')}
        className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition"
      >
        <List size={20} />
        <span>Situație Examene</span>
      </button>

      <button
        onClick={() => window.location.href = 'http://localhost:8000/secretariat/api/examene/export/excel'}
        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
      >
        <Download size={20} />
        <span>Descarcă Examene Excel</span>
      </button>
            <button
        onClick={() => window.location.href = 'http://localhost:8000/secretariat/api/examene/export/pdf'}
        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
      >
        <Download size={20} />
        <span>Descarcă Examene PDF</span>
      </button>
    </div>
  );
}
