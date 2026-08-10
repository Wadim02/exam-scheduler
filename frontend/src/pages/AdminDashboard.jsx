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

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

  const cards = [
    {
      title: "Manage Faculties",
      icon: <GraduationCap size={50} />,
      color: "bg-blue-500",
      route: "/admin/faculties",
    },
    {
      title: "Manage Professors",
      icon: <Users size={50} />,
      color: "bg-green-500",
      route: "/admin/professors",
    },
    {
      title: "Manage Secretariat",
      icon: <Users size={50} />,
      color: "bg-green-500",
      route: "/admin/secretariat",
    },
    {
      title: "Account Settings",
      icon: <Settings size={50} />,
      color: "bg-gray-500",
      route: "/admin/settings",
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
    <div className="min-h-screen py-6 bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
    <button
      onClick={handleLogout}
      className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
    >
      <LogOut size={20} />
      Logout
    </button>

      <div className="max-w-6xl w-full mx-auto">
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800">
          Administrator Dashboard
        </h1>

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