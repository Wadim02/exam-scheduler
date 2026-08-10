import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Eye,
  FileText,
  Calendar,
  Users,
} from "lucide-react";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatDashboard() {
  const navigate = useNavigate();

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


  const cards = [
    {
      title: "Manage Rooms",
      icon: <Eye size={50} />,
      color: "bg-gray-800",
      route: "/secretariat/rooms",
    },
    {
      title: "Manage Group Leaders",
      icon: <Users size={50} />,
      color: "bg-yellow-500",
      route: "/secretariat/group-leaders",
    },
    {
      title: "Manage Subjects",
      icon: <FileText size={50} />,
      color: "bg-blue-500",
      route: "/secretariat/subjects",
    },
    {
      title: "Manage Exams",
      icon: <Calendar size={50} />,
      color: "bg-green-600",
      route: "/secretariat/exams",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
    <button
      onClick={handleLogout}
      className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
    >
      <LogOut size={20} />
      Logout
    </button>

      <div className="max-w-6xl w-full mx-auto px-6">
        <h1 className="text-center text-5xl font-bold text-gray-800 mb-16">
          Secretariat Dashboard
        </h1>

        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {cards.map((card) => (
              <div
                key={card.title}
                onClick={() =>
                  navigate(card.route)
                }
                className={`${card.color} cursor-pointer rounded-3xl shadow-lg p-7 text-white flex flex-col items-center hover:scale-110 transition-transform`}
              >
                {card.icon}

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

export default SecretariatDashboard;