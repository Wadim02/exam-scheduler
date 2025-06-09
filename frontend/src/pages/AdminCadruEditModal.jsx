import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Save, X } from "lucide-react";

export default function CadruEditModal({ open, onClose, cadru, onSave }) {
  const [form, setForm] = useState({ ...cadru });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.facultyName.trim()) {
      setError("Toate câmpurile sunt obligatorii!");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    try {
      const res = await fetch("http://localhost:8000/admin/cadre/update", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Eroare la salvare");

      onSave(); // reîncarcă lista
      onClose(); // închide modalul
    } catch (err) {
      setError("Eroare la salvare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600">
            <X size={20} />
          </button>

          <Dialog.Title className="text-xl font-bold mb-4">✏️ Editare cadru</Dialog.Title>

          {error && <div className="text-red-600 mb-2">{error}</div>}

          <div className="grid gap-3">
            <input name="firstName" value={form.firstName} onChange={handleChange} className="border p-2 rounded" placeholder="Prenume" />
            <input name="lastName" value={form.lastName} onChange={handleChange} className="border p-2 rounded" placeholder="Nume" />
            <input name="facultyName" value={form.facultyName} onChange={handleChange} className="border p-2 rounded" placeholder="Facultate" />
            <input name="departmentName" value={form.departmentName} onChange={handleChange} className="border p-2 rounded" placeholder="Departament" />
            <input
  name="emailAddress"
  value={form.emailAddress}
  onChange={handleChange}
  className="border p-2 rounded"
/>
<input
  name="phoneNumber"
  value={form.phoneNumber || ""}
  onChange={handleChange}
  className="border p-2 rounded"
  placeholder="Telefon (opțional)"
/>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center">
            <Save className="mr-2" size={18} /> {loading ? "Salvez..." : "Salvează"}
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
