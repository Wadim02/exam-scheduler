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
    <div className="min-h-screen py-6 bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>

      <div className="max-w-4xl w-full mx-auto px-6">
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800">
          Panou Șef de Grupă
        </h1>
        <div className="flex justify-center mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-8">
          {tiles.map((tile) => (
            <div
              key={tile.title}
              onClick={() => navigate(tile.route)}
              className={`cursor-pointer ${tile.color} rounded-2xl shadow-lg p-8 text-white flex flex-col items-center hover:scale-110 transition-transform`}
            >
              {React.cloneElement(tile.icon, { size: 50 })}
              <span className="text-2xl font-semibold mt-4 text-center">
                {tile.title}
                </span>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
