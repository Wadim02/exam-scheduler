import React, { useState } from "react";
import {
  ArrowLeft,
  LogOut,
  ArrowBigUp,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatSubjects() {
  const navigate = useNavigate();

  const [generating, setGenerating] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  const [generateMessage, setGenerateMessage] =
    useState(null);

  const [importMessage, setImportMessage] =
    useState(null);

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

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMessage(null);

    try {
      const response = await fetch(
        `${API}/secretariat/subjects/generate`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate subjects"
        );
      }

      setGenerateMessage({
        type: "success",
        text:
          data.message ||
          "Subjects generated successfully.",
      });
    } catch (error) {
      setGenerateMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImport = async () => {
    const confirmed =
      window.confirm(
        "Importing the generated subjects will replace the current subject list and remove existing exam proposals.\n\nContinue?"
      );

    if (!confirmed) {
      return;
    }

    setImporting(true);
    setImportMessage(null);

    try {
      const response = await fetch(
        `${API}/secretariat/import-subjects-csv`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to import subjects"
        );
      }

      setImportMessage({
        type: "success",
        text:
          data.message ||
          "Subjects imported successfully.",
      });
    } catch (error) {
      setImportMessage({
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
          Subject Management
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className="font-semibold mb-2">
              Generate Subjects
            </h2>

            <p className="text-sm text-gray-600 mb-3">
              Generate subjects from the
              university schedule API.
            </p>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-green-600 text-white flex items-center px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              <RefreshCw
                className={`mr-2 ${
                  generating
                    ? "animate-spin"
                    : ""
                }`}
                size={20}
              />

              {generating
                ? "Generating..."
                : "Generate Subjects"}
            </button>

            {generateMessage && (
              <p
                className={`mt-3 ${
                  generateMessage.type ===
                  "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {generateMessage.text}
              </p>
            )}
          </div>

          <hr />

          <div>
            <h2 className="font-semibold mb-2">
              Import Generated Subjects
            </h2>

            <p className="text-sm text-gray-600 mb-3">
              Import the generated subject
              list into the database.
            </p>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 text-white flex items-center px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              <ArrowBigUp
                className="mr-2"
                size={20}
              />

              {importing
                ? "Importing..."
                : "Import Subjects"}
            </button>

            {importMessage && (
              <p
                className={`mt-3 ${
                  importMessage.type ===
                  "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {importMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecretariatSubjects;