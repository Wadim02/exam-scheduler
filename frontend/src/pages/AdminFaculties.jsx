import React, { useCallback, useEffect, useState } from "react";
import {
  Trash2,
  Save,
  PlusCircle,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function AdminFaculties() {
  const [faculties, setFaculties] = useState([]);

  const [newFaculty, setNewFaculty] = useState({
    longName: "",
    shortName: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showMessage = (text, type = "success") => {
    setMessage({
      text,
      type,
    });

    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const loadFaculties = useCallback(async () => {
    try {
      const response = await fetch(
        `${API}/api/admin/faculties`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load faculties");
      }

      const data = await response.json();

      setFaculties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      showMessage(
        "Failed to load faculties.",
        "error"
      );
    }
  }, []);

  useEffect(() => {
    loadFaculties();
  }, [loadFaculties]);

  const handleLogout = async () => {
    localStorage.removeItem("token");

    try {
      await fetch(`${API}/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    navigate("/login");
  };

  const handleFacultyChange = (
    facultyId,
    field,
    value
  ) => {
    setFaculties((previous) =>
      previous.map((faculty) =>
        faculty.id === facultyId
          ? {
              ...faculty,
              [field]: value,
            }
          : faculty
      )
    );
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    faculties.forEach((faculty) => {
      formData.append(
        `longName_${faculty.id}`,
        faculty.longName
      );

      formData.append(
        `shortName_${faculty.id}`,
        faculty.shortName
      );
    });

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/faculties/update`,
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
            "Failed to update faculties"
        );
      }

      showMessage(
        data.message ||
          "Faculties updated successfully."
      );

      await loadFaculties();
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    if (
      !newFaculty.longName.trim() ||
      !newFaculty.shortName.trim()
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "longName",
      newFaculty.longName.trim()
    );

    formData.append(
      "shortName",
      newFaculty.shortName.trim()
    );

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/faculties/add`,
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
            "Failed to add faculty"
        );
      }

      setNewFaculty({
        longName: "",
        shortName: "",
      });

      showMessage(
        data.message ||
          "Faculty added successfully."
      );

      await loadFaculties();
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this faculty?"
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.append("id", id);

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/faculties/delete`,
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
            "Failed to delete faculty"
        );
      }

      showMessage(
        data.message ||
          "Faculty deleted successfully."
      );

      await loadFaculties();
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 py-10">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>

      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>

        {message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 ${
              message.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          <PlusCircle className="inline-block mr-2" />
          Add New Faculty
        </h3>

        <form
          onSubmit={handleAdd}
          className="bg-white rounded shadow-lg p-6"
        >
          <label className="block mb-4">
            <span className="text-gray-700 font-medium">
              Faculty Name
            </span>

            <input
              type="text"
              value={newFaculty.longName}
              onChange={(event) =>
                setNewFaculty({
                  ...newFaculty,
                  longName: event.target.value,
                })
              }
              placeholder="Faculty of Computer Science"
              required
              disabled={loading}
              className="border rounded p-2 w-full mt-1"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700 font-medium">
              Abbreviation
            </span>

            <input
              type="text"
              value={newFaculty.shortName}
              onChange={(event) =>
                setNewFaculty({
                  ...newFaculty,
                  shortName: event.target.value,
                })
              }
              placeholder="FCS"
              required
              disabled={loading}
              className="border rounded p-2 w-full mt-1"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center"
          >
            <PlusCircle className="mr-2" />
            Add Faculty
          </button>
        </form>

        <hr className="my-8" />

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Faculty Management
        </h2>

        <form onSubmit={handleUpdate}>
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="px-4 py-3">
                    ID
                  </th>

                  <th className="px-4 py-3">
                    Name
                  </th>

                  <th className="px-4 py-3">
                    Abbreviation
                  </th>

                  <th className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {faculties.map((faculty) => (
                  <tr
                    key={faculty.id}
                    className="border-b hover:bg-teal-50"
                  >
                    <td className="px-4 py-3">
                      {faculty.id}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={faculty.longName}
                        onChange={(event) =>
                          handleFacultyChange(
                            faculty.id,
                            "longName",
                            event.target.value
                          )
                        }
                        required
                        className="border p-2 rounded w-full"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={faculty.shortName}
                        onChange={(event) =>
                          handleFacultyChange(
                            faculty.id,
                            "shortName",
                            event.target.value
                          )
                        }
                        required
                        className="border p-2 rounded w-full"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(faculty.id)
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg"
            >
              <Save className="mr-2" size={20} />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminFaculties;