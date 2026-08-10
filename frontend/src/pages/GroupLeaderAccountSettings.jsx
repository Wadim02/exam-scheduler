import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function GroupLeaderAccountSettings() {
  const navigate = useNavigate();

  const API =
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    localStorage.removeItem("token");

    await fetch(`${API}/logout`, {
      credentials: "include",
    });

    navigate("/login");
  };

  useEffect(() => {
    axios
      .get(`${API}/group-leader/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
        });
      })
      .catch((error) => {
        console.error(
          "Failed to load profile:",
          error
        );

        setIsError(true);
        setMessage("Failed to load account data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    try {
      const {
        email,
        ...payload
      } = form;

      const response = await axios.put(
        `${API}/group-leader/update`,
        payload,
        {
          withCredentials: true,
        }
      );

      setMessage(
        response.data.message ||
          "Account updated successfully."
      );
    } catch (error) {
      console.error("Update failed:", error);

      setIsError(true);
      setMessage(
        error.response?.data?.detail ||
          "Failed to update account."
      );
    }
  };

  if (loading) {
    return (
      <p className="p-6">
        Loading account settings...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 py-10 px-6">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>

      <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
        <button
          onClick={() =>
            navigate("/group-leader")
          }
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>

        <h2 className="text-2xl mb-4">
          Group Leader Account Settings
        </h2>

        {message && (
          <div
            className={`mb-3 p-2 rounded ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1">
              First name
            </label>

            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              Last name
            </label>

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              Phone number
            </label>

            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default GroupLeaderAccountSettings;