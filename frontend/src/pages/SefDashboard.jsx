import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileEdit,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

export default function SefDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };

  const tiles = [
    {
      icon: <FileEdit size={25} />,
      title: "Propune examen",
      route: "/sefgrupa/propunere",
      color: "bg-blue-500",
    },
    {
      icon: <ClipboardList size={25} />,
      title: "Status discipline",
      route: "/sefgrupa/status",
      color: "bg-green-500",
    },
    {
      icon: <Settings size={25} />,
      title: "Setări cont",
      route: "/sefgrupa/setari",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">📚 Panou Șef de Grupă</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {tiles.map((tile) => (
            <div
              key={tile.title}
              onClick={() => navigate(tile.route)}
              className={`cursor-pointer p-6 rounded-xl shadow-lg text-white flex flex-col items-center justify-center hover:scale-105 transition ${tile.color}`}
            >
              {tile.icon}
              <span className="text-xl font-semibold mt-4">{tile.title}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded shadow flex items-center"
          >
            <LogOut className="mr-2" size={18} />
            Deconectare
          </button>
        </div>
      </div>
    </div>
  );
}
