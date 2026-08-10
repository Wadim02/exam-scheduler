import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  CheckCircle,
  Users,
  LogOut,
} from "lucide-react";

function ProfessorDashboard() {
  const navigate = useNavigate();

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

  const cards = [
    {
      title: "Review Proposals",
      icon: <UserCheck size={25} />,
      color: "bg-indigo-500",
      route: "/professor/proposals",
    },
    {
      title: "Accepted Exams",
      icon: <CheckCircle size={25} />,
      color: "bg-green-500",
      route: "/professor/accepted-exams",
    },
    {
      title: "Assistant Exams",
      icon: <Users size={25} />,
      color: "bg-yellow-500",
      route: "/professor/assistant-exams",
    },
  ];

  const handleLogout = async () => {
    try {
        await fetch(`${API}/logout`, {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        navigate("/login", { replace: true });
    }
};

  return (
    <div className="min-h-screen py-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 relative flex flex-col justify-center p-6">
    <button
      onClick={handleLogout}
      className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
    >
      <LogOut size={20} />
      Logout
    </button>

      <div className="max-w-4xl w-full mx-auto px-6">
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800">
          Professor Dashboard
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

export default ProfessorDashboard;