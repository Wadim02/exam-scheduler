import React, {
  useEffect,
  useState,
} from "react";

import {
  Save,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function AdminSettings() {
  const [profile, setProfile] =
    useState(null);

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      emailAddress: "",
      facultyName: "",
      departmentName: "",
    });

  const [message, setMessage] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

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
    }, 4000);
  };

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${API}/admin/profile`,
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
              "Failed to load profile"
          );
        }

        const data =
          await response.json();

        setProfile(data);

        setFormData({
          firstName:
            data.firstName || "",
          lastName:
            data.lastName || "",
          emailAddress:
            data.emailAddress || "",
          facultyName:
            data.facultyName || "",
          departmentName:
            data.departmentName || "",
        });
      } catch (error) {
        showMessage(
          error.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.facultyName.trim() ||
      !formData.departmentName.trim()
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    const body = new FormData();

    body.append("id", profile.id);

    body.append(
      "firstName",
      formData.firstName.trim()
    );

    body.append(
      "lastName",
      formData.lastName.trim()
    );

    body.append(
      "facultyName",
      formData.facultyName.trim()
    );

    body.append(
      "departmentName",
      formData.departmentName.trim()
    );

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/admin/profile/update`,
        {
          method: "POST",
          credentials: "include",
          body,
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
        "Changes saved successfully."
      );
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20">
        Loading account data...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-red-600">
        Administrator profile could not
        be loaded.
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100">
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

      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
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
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow text-white z-50 ${
              message.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Administrator Account Settings
        </h2>

        <div className="grid gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            disabled={saving}
            className="border rounded p-2"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            disabled={saving}
            className="border rounded p-2"
          />

          <input
            type="email"
            name="emailAddress"
            placeholder="Email"
            value={formData.emailAddress}
            readOnly
            className="border rounded p-2 bg-gray-100 cursor-not-allowed"
          />

          <input
            type="text"
            name="facultyName"
            placeholder="Faculty"
            value={formData.facultyName}
            onChange={handleChange}
            disabled={saving}
            className="border rounded p-2"
          />

          <input
            type="text"
            name="departmentName"
            placeholder="Department"
            value={formData.departmentName}
            onChange={handleChange}
            disabled={saving}
            className="border rounded p-2"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
        >
          <Save
            className="mr-2"
            size={18}
          />

          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;