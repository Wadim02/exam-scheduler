import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut
} from "lucide-react";

export default function SecretariatDashboard() {
  const navigate = useNavigate();
    const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard Secretariat</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gestionare săli */}
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          onClick={() => window.location.href = '/secretariat/sali'}
        >
          👁️ Gestionare săli
        </button>

        {/* Gestionare șefi de grupă */}
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          onClick={() => window.location.href = '/secretariat/sefgrupe'}
        >
          📝 Gestionare șefi de grupă
        </button>

        {/* Lista examene programate */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => window.location.href = '/secretariat/discipline'}
        >
          📝 Gestionare Discipline
        </button>

        {/* CRUD examene programate */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => window.location.href = '/secretariat/examene'}
        >
          📝 Gestionare Examene
        </button>
      </div>
      <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow">
            <LogOut className="mr-2" size={20} />
            Deconectare
          </button>
        </div>
    </div>
  );
}
