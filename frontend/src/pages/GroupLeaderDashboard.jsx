import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileEdit,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

function GroupLeaderDashboard() {
  const navigate = useNavigate();

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

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


  const tiles = [
    {
      icon: <FileEdit size={25} />,
      title: "Propose Exam",
      route: "/group-leader/proposal",
      color: "bg-blue-500",
    },
    {
      icon: <ClipboardList size={25} />,
      title: "Subject Status",
      route: "/group-leader/subject-status",
      color: "bg-green-500",
    },
    {
      icon: <Settings size={25} />,
      title: "Account Settings",
      route: "/group-leader/account-settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen py-6 bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col justify-center items-center p-6">
    <button
      onClick={handleLogout}
      className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
    >
      <LogOut size={20} />
      Logout
    </button>

      <div className="max-w-4xl w-full mx-auto px-6">
        <h1 className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl font-bold text-gray-800">
          Group Leader Dashboard
        </h1>

        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {tiles.map((tile) => (
              <div
                key={tile.title}
                onClick={() => navigate(tile.route)}
                className={`cursor-pointer ${tile.color} rounded-2xl shadow-lg p-8 text-white flex flex-col items-center hover:scale-110 transition-transform`}
              >
                {React.cloneElement(tile.icon, {
                  size: 50,
                })}

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

export default GroupLeaderDashboard;