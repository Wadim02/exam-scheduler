import React, { useState } from "react";
import {
  ArrowLeft,
  LogOut,
  ArrowBigUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatGroupLeaders() {
  const [file, setFile] =
    useState(null);

  const [importing, setImporting] =
    useState(false);

  const [message, setMessage] =
    useState(null);

  const navigate = useNavigate();

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

  const handleImport = async (
    event
  ) => {
    event.preventDefault();

    if (!file) {
      setMessage({
        type: "error",
        text: "Please select an .xlsx file first.",
      });

      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setImporting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API}/secretariat/import-group-leaders`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to import group leaders"
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          `Imported: ${
            data.imported || 0
          }, updated: ${
            data.updated || 0
          }.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 py-10">
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

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
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

        <h1 className="text-2xl font-bold mb-6">
          Group Leader Management
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleImport}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium">
              Group Leaders Excel File
            </span>

            <input
              type="file"
              accept=".xlsx"
              onChange={(event) =>
                setFile(
                  event.target.files[0] ||
                    null
                )
              }
              className="mt-1 block w-full"
              required
            />
          </label>

          <button
            type="submit"
            disabled={importing}
            className="px-4 py-2 rounded text-white flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <ArrowBigUp
              className="mr-2"
              size={20}
            />

            {importing
              ? "Importing..."
              : "Import Group Leaders"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/secretariat/group-leaders/edit"
            )
          }
          className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center"
        >
          <Users
            className="mr-2"
            size={20}
          />
          View and Edit Group Leaders
        </button>
      </div>
    </div>
  );
}

export default SecretariatGroupLeaders;