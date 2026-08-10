import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  Save,
  PlusCircle,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function AdminSecretariat() {
  const [secretaries, setSecretaries] =
    useState([]);

  const [newSecretary, setNewSecretary] =
    useState({
      firstName: "",
      lastName: "",
      emailAddress: "",
      facultyName: "",
      departmentName: "",
    });

  const [message, setMessage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [savingId, setSavingId] =
    useState(null);

  const navigate = useNavigate();

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage({
      text,
      type,
    });

    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const loadSecretaries =
    useCallback(async () => {
      try {
        const response = await fetch(
          `${API}/admin/secretariat/json`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load secretariat users"
          );
        }

        const data =
          await response.json();

        setSecretaries(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);

        showMessage(
          "Failed to load secretariat users.",
          "error"
        );
      }
    }, []);

  useEffect(() => {
    loadSecretaries();
  }, [loadSecretaries]);

  const handleLogout = async () => {
    localStorage.removeItem("token");

    try {
      await fetch(`${API}/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    }

    navigate("/login");
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );

  const handleAdd = async (event) => {
    event.preventDefault();

    if (
      !newSecretary.firstName.trim() ||
      !newSecretary.lastName.trim() ||
      !newSecretary.emailAddress.trim() ||
      !newSecretary.facultyName.trim() ||
      !newSecretary.departmentName.trim()
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    if (
      !validateEmail(
        newSecretary.emailAddress
      )
    ) {
      showMessage(
        "Invalid email address.",
        "error"
      );
      return;
    }

    const formData = new FormData();

    Object.entries(
      newSecretary
    ).forEach(([key, value]) => {
      formData.append(
        key,
        value.trim()
      );
    });

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/secretariat/add`,
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

        throw new Error(
          data.detail ||
            "Failed to add secretariat user"
        );
      }

      setNewSecretary({
        firstName: "",
        lastName: "",
        emailAddress: "",
        facultyName: "",
        departmentName: "",
      });

      showMessage(
        "Secretariat user added successfully."
      );

      await loadSecretaries();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    id,
    field,
    value
  ) => {
    setSecretaries((previous) =>
      previous.map((secretary) =>
        secretary.id === id
          ? {
              ...secretary,
              [field]: value,
            }
          : secretary
      )
    );
  };

  const handleSave = async (
    secretary
  ) => {
    if (
      !secretary.firstName.trim() ||
      !secretary.lastName.trim() ||
      !secretary.emailAddress.trim() ||
      !secretary.facultyName.trim() ||
      !secretary.departmentName.trim()
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "id",
      secretary.id
    );

    formData.append(
      "firstName",
      secretary.firstName.trim()
    );

    formData.append(
      "lastName",
      secretary.lastName.trim()
    );

    formData.append(
      "emailAddress",
      secretary.emailAddress.trim()
    );

    formData.append(
      "facultyName",
      secretary.facultyName.trim()
    );

    formData.append(
      "departmentName",
      secretary.departmentName.trim()
    );

    setSavingId(secretary.id);

    try {
      const response = await fetch(
        `${API}/admin/secretariat/update`,
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
            "Failed to save changes"
        );
      }

      showMessage(
        "Secretariat user updated successfully."
      );

      await loadSecretaries();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this secretariat user?"
      );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.append("id", id);

    setSavingId(id);

    try {
      const response = await fetch(
        `${API}/admin/secretariat/delete`,
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

        throw new Error(
          data.detail ||
            "Failed to delete secretariat user"
        );
      }

      showMessage(
        "Secretariat user deleted successfully."
      );

      await loadSecretaries();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 py-10">
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

      <div className="max-w-6xl mx-auto px-6 relative">
        <button
          onClick={() =>
            navigate("/admin")
          }
          className="mb-4 flex items-center"
        >
          <ArrowLeft
            className="mr-2"
            size={20}
          />
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

        <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="mr-2" />
          Add Secretariat User
        </h3>

        <form
          onSubmit={handleAdd}
          className="bg-white rounded shadow-lg p-6 mb-10 grid gap-4"
        >
          <input
            type="text"
            placeholder="First Name"
            required
            value={newSecretary.firstName}
            onChange={(event) =>
              setNewSecretary({
                ...newSecretary,
                firstName:
                  event.target.value,
              })
            }
            disabled={loading}
            className="border rounded p-2"
          />

          <input
            type="text"
            placeholder="Last Name"
            required
            value={newSecretary.lastName}
            onChange={(event) =>
              setNewSecretary({
                ...newSecretary,
                lastName:
                  event.target.value,
              })
            }
            disabled={loading}
            className="border rounded p-2"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={
              newSecretary.emailAddress
            }
            onChange={(event) =>
              setNewSecretary({
                ...newSecretary,
                emailAddress:
                  event.target.value,
              })
            }
            disabled={loading}
            className="border rounded p-2"
          />

          <input
            type="text"
            placeholder="Faculty"
            required
            value={
              newSecretary.facultyName
            }
            onChange={(event) =>
              setNewSecretary({
                ...newSecretary,
                facultyName:
                  event.target.value,
              })
            }
            disabled={loading}
            className="border rounded p-2"
          />

          <input
            type="text"
            placeholder="Department"
            required
            value={
              newSecretary.departmentName
            }
            onChange={(event) =>
              setNewSecretary({
                ...newSecretary,
                departmentName:
                  event.target.value,
              })
            }
            disabled={loading}
            className="border rounded p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center justify-center"
          >
            <PlusCircle className="mr-2" />

            {loading
              ? "Adding..."
              : "Add Secretariat User"}
          </button>
        </form>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Secretariat Management
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-3">
                  First Name
                </th>

                <th className="px-4 py-3">
                  Last Name
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  Faculty
                </th>

                <th className="px-4 py-3">
                  Department
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {secretaries.map(
                (secretary) => {
                  const saving =
                    savingId ===
                    secretary.id;

                  return (
                    <tr
                      key={secretary.id}
                      className="border-b hover:bg-teal-50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={
                            secretary.firstName
                          }
                          onChange={(
                            event
                          ) =>
                            handleFieldChange(
                              secretary.id,
                              "firstName",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={
                            secretary.lastName
                          }
                          onChange={(
                            event
                          ) =>
                            handleFieldChange(
                              secretary.id,
                              "lastName",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={
                            secretary.emailAddress
                          }
                          onChange={(
                            event
                          ) =>
                            handleFieldChange(
                              secretary.id,
                              "emailAddress",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={
                            secretary.facultyName
                          }
                          onChange={(
                            event
                          ) =>
                            handleFieldChange(
                              secretary.id,
                              "facultyName",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={
                            secretary.departmentName
                          }
                          onChange={(
                            event
                          ) =>
                            handleFieldChange(
                              secretary.id,
                              "departmentName",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSave(
                                secretary
                              )
                            }
                            disabled={
                              saving
                            }
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                            title="Save"
                          >
                            <Save
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                secretary.id
                              )
                            }
                            disabled={
                              saving
                            }
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            title="Delete"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {secretaries.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No secretariat users found.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminSecretariat;