import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  LogOut, Eye, FileText, Calendar, Users
} from "lucide-react";


export default function SecretariatDashboard() {
  const navigate = useNavigate();
    const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };
 const cards = [
  
    {
      title: 'Gestionare săli',
      icon: <Eye size={50} />,  
      color: 'bg-gray-800',
      route: '/secretariat/sali',
    },
    {
      title: 'Gestionare șefi de grupă',
      icon: <Users size={50} />,
      color: 'bg-yellow-500',
      route: '/secretariat/sefgrupe',
    },
    {
      title: 'Gestionare discipline',
      icon: <FileText size={50} />,
      color: 'bg-blue-500',
      route: '/secretariat/discipline',
    },
    {
      title: 'Gestionare examene',
      icon: <Calendar size={50} />,
      color: 'bg-green-600',
      route: '/secretariat/examene',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
      {/* Logout fixat sus-dreapta */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>

      <div className="max-w-6xl w-full mx-auto px-6">
        {/* Titlu poziționat similar AdminDashboard */}
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-6xl font-bold text-gray-800">
          Panou Secretariat
        </h1>

        {/* Card-urile centrate */}
        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {cards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className={`${card.color} cursor-pointer rounded-3xl shadow-lg p-7 text-white flex flex-col items-center hover:scale-110 transition-transform`}
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
