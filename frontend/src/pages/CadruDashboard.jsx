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
      icon: <UserCheck size={25} />,
      color: "bg-indigo-500",
      route: "/cadru/propuneri"
    },
    {
      title: "Examene acceptate",
      icon: <CheckCircle size={25} />,
      color: "bg-green-500",
      route: "/cadru/examene-acceptate"
    },
    {
      title: "Examene ca asistent",
      icon: <Users size={25} />,
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
<div className="min-h-screen py-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 relative flex flex-col justify-center p-6">
     {/* Butonul fixat în colţul din dreapta sus */}
     <button
       onClick={handleLogout}
       className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
     >
      <LogOut className="mr-2" size={18} />
       Deconectare
     </button>

     <div className="max-w-4xl w-full mx-auto px-6">
      
         <h1
      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800"
    >
          Panou Cadru Didactic
        </h1>

        <div className="flex justify-center mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.route)}
              className={`cursor-pointer ${card.color} hover:scale-110 transition-transform rounded-2xl shadow-lg p-8 text-white flex flex-col items-center`}
            >
              {React.cloneElement(card.icon, { size: 50 })}
              <h2 className="text-2xl font-semibold text-center mt-4">
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

export default CadruDashboard;
