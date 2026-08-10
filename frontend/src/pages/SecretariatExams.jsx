import React, { useState } from "react";
import {
  Pencil,
  List,
  Download,
  LogOut,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ExamLimitsModal from "./ExamLimitsModal";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatExams() {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [downloading, setDownloading] =
    useState("");

  const handleLogout = async () => {
    localStorage.removeItem("token");

    try {
      await fetch(`${API}/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }

    navigate("/login");
  };

  const handleDownload = async (
    endpoint,
    filename
  ) => {
    setDownloading(filename);

    try {
      const response = await fetch(
        `${API}${endpoint}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.detail ||
            "Download failed"
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloading("");
    }
  };

  const cards = [
    {
      title: "Configure Exam Period",
      icon: <Settings size={30} />,
      color: "bg-indigo-600",
      action: () =>
        setModalOpen(true),
    },
    {
      title: "Edit Exams",
      icon: <Pencil size={30} />,
      color: "bg-blue-800",
      action: () =>
        navigate(
          "/secretariat/exams/edit"
        ),
    },
    {
      title: "Exam Status",
      icon: <List size={30} />,
      color: "bg-purple-500",
      action: () =>
        navigate(
          "/secretariat/exams/status"
        ),
    },
    {
      title: "Download Excel",
      icon: <Download size={30} />,
      color: "bg-green-600",
      action: () =>
        handleDownload(
          "/secretariat/api/exams/export/excel",
          "exams_status.xlsx"
        ),
    },
    {
      title: "Download PDF",
      icon: <Download size={30} />,
      color: "bg-green-600",
      action: () =>
        handleDownload(
          "/secretariat/api/exams/export/pdf",
          "exams_status.pdf"
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col items-center p-10">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut
          className="mr-2"
          size={18}
        />
        Logout
      </button>

      <div className="max-w-5xl mx-auto bg-white w-full rounded-lg shadow p-6">
        <button
          onClick={() =>
            navigate("/secretariat")
          }
          className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft
            className="mr-2"
            size={20}
          />
          Back
        </button>

        <h1 className="text-4xl font-bold text-center mb-8">
          Exam Management
        </h1>

        {downloading && (
          <p className="text-center text-gray-600 mb-4">
            Downloading {downloading}...
          </p>
        )}

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                onClick={card.action}
                className={`${card.color} cursor-pointer rounded-3xl shadow-lg p-5 text-white flex flex-col items-center hover:scale-105 transition-transform`}
              >
                {card.icon}

                <h2 className="text-xl font-semibold text-center mt-4">
                  {card.title}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExamLimitsModal
        isOpen={modalOpen}
        onRequestClose={() =>
          setModalOpen(false)
        }
      />
    </div>
  );
}

export default SecretariatExams;