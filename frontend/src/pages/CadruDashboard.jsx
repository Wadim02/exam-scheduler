import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  CheckCircle,
  Users,
  LogOut
} from "lucide-react";

function CadruDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Confirmare propuneri",
      icon: <UserCheck size={40} />,
      color: "bg-indigo-500",
      route: "/cadru/propuneri"
    },
    {
      title: "Examene acceptate",
      icon: <CheckCircle size={40} />,
      color: "bg-green-500",
      route: "/cadru/examene-acceptate"
    },
    {
      title: "Examene ca asistent",
      icon: <Users size={40} />,
      color: "bg-yellow-500",
      route: "/cadru/asistent"
    }
  ];

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen py-10 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Panou Cadru Didactic
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.route)}
              className={`cursor-pointer ${card.color} hover:scale-105 transition-transform rounded-2xl shadow-lg p-6 text-white flex flex-col items-center`}
            >
              {card.icon}
              <h2 className="text-xl font-semibold text-center mt-4">
                {card.title}
              </h2>
            </div>
          ))}
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
    </div>
  );
}

export default CadruDashboard;
