import React from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Gestionare facultăți",
      icon: <GraduationCap size={40} />,
      color: "bg-blue-500",
      route: "/admin/facultati",
    },
    {
      title: "Gestionare Cadre",
      icon: <Users size={40} />,
      color: "bg-green-500",
      route: "/admin/cadre",
    },
    {
      title: "Gestionare Secretariat",
      icon: <Users size={40} />,
      color: "bg-green-500",
      route: "/admin/secretariat",
    },
    {
      title: "Setări generale",
      icon: <Settings size={40} />,
      color: "bg-gray-500",
      route: "/admin/setari",
    },
  ];

  const handleLogout = async () => {
 // Șterge tokenul din localStorage dacă e cazul
  localStorage.removeItem("token");

  // Trimite cerere la backend pentru ștergerea cookie-ului
  await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });

  // Redirecționează la login
  navigate("/login");
  };

  return (
    <div className="min-h-screen py-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Panou Administrativ
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.route)}
              className={`cursor-pointer ${card.color} hover:scale-105 transition-transform rounded-xl shadow-xl p-6 text-white flex flex-col items-center`}
            >
              {card.icon}
              <h2 className="text-xl font-semibold text-center mt-4">
                {card.title}
              </h2>
            </div>
          ))}
        </div>

        {/* Buton logout */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
          >
            <LogOut className="mr-2" size={20} />
            Deconectare
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
