import React, {
  useEffect,
  useState,
} from "react";
import { Dialog } from "@headlessui/react";
import { Save, X } from "lucide-react";

const API = "http://localhost:8000";

function AdminProfessorEditModal({
  open,
  onClose,
  professor,
  onSave,
}) {
  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    facultyName: "",
    departmentName: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!professor) {
      return;
    }

    setForm({
      id: professor.id,
      firstName: professor.firstName || "",
      lastName: professor.lastName || "",
      emailAddress:
        professor.emailAddress || "",
      phoneNumber:
        professor.phoneNumber || "",
      facultyName:
        professor.facultyName || "",
      departmentName:
        professor.departmentName || "",
    });

    setError("");
  }, [professor]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.emailAddress.trim() ||
      !form.facultyName.trim() ||
      !form.departmentName.trim()
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    if (
      !form.emailAddress
        .toLowerCase()
        .endsWith("@usm.ro")
    ) {
      setError(
        "Professor email must use the @usm.ro domain."
      );
      return;
    }

    const formData = new FormData();

    formData.append("id", form.id);
    formData.append(
      "firstName",
      form.firstName.trim()
    );
    formData.append(
      "lastName",
      form.lastName.trim()
    );
    formData.append(
      "emailAddress",
      form.emailAddress.trim()
    );
    formData.append(
      "phoneNumber",
      form.phoneNumber.trim()
    );
    formData.append(
      "facultyName",
      form.facultyName.trim()
    );
    formData.append(
      "departmentName",
      form.departmentName.trim()
    );

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/admin/faculty-members/update`,
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
            "Failed to update professor"
        );
      }

      if (onSave) {
        await onSave();
      }

      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-20"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
          >
            <X size={20} />
          </button>

          <Dialog.Title className="text-xl font-bold mb-4">
            Edit Professor
          </Dialog.Title>

          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="First Name"
              disabled={loading}
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Last Name"
              disabled={loading}
            />

            <input
              type="email"
              name="emailAddress"
              value={form.emailAddress}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Email (@usm.ro)"
              disabled={loading}
            />

            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Phone Number (optional)"
              disabled={loading}
            />

            <input
              name="facultyName"
              value={form.facultyName}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Faculty"
              disabled={loading}
            />

            <input
              name="departmentName"
              value={form.departmentName}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Department"
              disabled={loading}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <Save
              className="mr-2"
              size={18}
            />

            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default AdminProfessorEditModal;