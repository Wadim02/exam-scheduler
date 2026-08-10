import React, { useState } from "react";
import {
  ArrowLeft,
  LogOut,
  ArrowBigUp,
  ArrowBigDown,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatRooms() {
  const navigate = useNavigate();

  const [downloading, setDownloading] =
    useState(false);

  const [file, setFile] =
    useState(null);

  const [importing, setImporting] =
    useState(false);

  const [message, setMessage] =
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

  const downloadRooms = async () => {
    setDownloading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API}/secretariat/discover-rooms`,
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
            "Failed to download rooms"
        );
      }

      const blob = await response.blob();
      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = "rooms.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Rooms file downloaded successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setDownloading(false);
    }
  };

  const performImport = async (
    force = false
  ) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${API}/secretariat/upload-rooms${
        force ? "?force=true" : ""
      }`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({}));

      const error = new Error(
        data.detail ||
          "Failed to import rooms"
      );

      error.status = response.status;
      error.detail = data.detail;

      throw error;
    }

    return response.json();
  };

  const importRooms = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage({
        type: "error",
        text: "Please select an .xlsx file first.",
      });

      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      const data =
        await performImport();

      setMessage({
        type: "success",
        text: `${data.imported || 0} rooms imported successfully.`,
      });
    } catch (error) {
      if (
        error.status === 409 &&
        error.detail ===
          "ForeignKeyViolation"
      ) {
        const confirmed =
          window.confirm(
            "Existing exam proposals reference the current rooms.\n\n" +
              "Continue and delete those exam proposals before importing the new rooms?"
          );

        if (confirmed) {
          try {
            const data =
              await performImport(true);

            setMessage({
              type: "success",
              text: `${data.imported || 0} rooms imported successfully.`,
            });
          } catch (forceError) {
            setMessage({
              type: "error",
              text: forceError.message,
            });
          }
        } else {
          setMessage({
            type: "error",
            text: "Import cancelled.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: error.message,
        });
      }
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
        <LogOut className="mr-2" size={18} />
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

        <h1 className="text-3xl font-bold mb-6">
          Room Management
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

        <button
          type="button"
          onClick={downloadRooms}
          disabled={downloading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center disabled:bg-gray-400"
        >
          <ArrowBigDown
            className="mr-2"
            size={20}
          />

          {downloading
            ? "Downloading..."
            : "Download Rooms"}
        </button>

        <form
          onSubmit={importRooms}
          className="space-y-3 mt-6"
        >
          <label className="block">
            <span className="text-sm font-medium">
              Upload .xlsx file
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
              className="block mt-1"
              required
            />
          </label>

          <button
            type="submit"
            disabled={importing}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center disabled:bg-gray-400"
          >
            <ArrowBigUp
              className="mr-2"
              size={20}
            />

            {importing
              ? "Importing..."
              : "Import Rooms"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/secretariat/rooms/edit"
            )
          }
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 mt-6 flex items-center"
        >
          <Eye
            className="mr-2"
            size={20}
          />
          View and Edit Rooms
        </button>
      </div>
    </div>
  );
}

export default SecretariatRooms;