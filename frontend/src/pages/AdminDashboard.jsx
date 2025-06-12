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
      icon: <GraduationCap size={50} />,
      color: "bg-blue-500",
      route: "/admin/facultati",
    },
    {
      title: "Gestionare Cadre",
      icon: <Users size={50} />,
      color: "bg-green-500",
      route: "/admin/cadre",
    },
    {
      title: "Gestionare Secretariat",
      icon: <Users size={50} />,
      color: "bg-green-500",
      route: "/admin/secretariat",
    },
    {
      title: "Setări generale",
      icon: <Settings size={50} />,
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
    <div className="min-h-screen py-6 bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>

      <div className="max-w-6xl w-full mx-auto">
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800">
          Panou Administrativ
        </h1>

          {/* Card-urile centrate */}
        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {cards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className={`${card.color} cursor-pointer rounded-2xl shadow-lg p-10 text-white flex flex-col items-center hover:scale-110 transition-transform`}
              >
                {card.icon}
                <h2 className="text-3xl font-semibold text-center mt-4">
                  {card.title}
                </h2>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
