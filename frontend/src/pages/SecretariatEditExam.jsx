import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Dialog } from "@headlessui/react";

import {
  Pencil,
  Trash2,
  Save,
  X,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function EditExamModal({
  open,
  onClose,
  exam,
  onSave,
}) {
  const [form, setForm] = useState({
    date: "",
    room_id: "",
    assistant_id: "",
    professor_id: "",
  });

  const [rooms, setRooms] =
    useState([]);

  const [assistants, setAssistants] =
    useState([]);

  const [professors, setProfessors] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!exam) {
      return;
    }

    setForm({
      date: exam.date
        ? exam.date.slice(0, 16)
        : "",
      room_id:
        exam.room?.id ?? "",
      assistant_id:
        exam.assistant?.id ?? "",
      professor_id:
        exam.professor?.id ?? "",
    });

    setError("");
  }, [exam]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadReferenceData =
      async () => {
        try {
          const [
            roomsResponse,
            assistantsResponse,
            professorsResponse,
          ] = await Promise.all([
            fetch(
              `${API}/secretariat/api/rooms`,
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              `${API}/secretariat/api/assistants`,
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              `${API}/secretariat/api/professors`,
              {
                credentials:
                  "include",
              }
            ),
          ]);

          if (!roomsResponse.ok) {
            throw new Error(
              "Failed to load rooms"
            );
          }

          if (!assistantsResponse.ok) {
            throw new Error(
              "Failed to load assistants"
            );
          }

          if (!professorsResponse.ok) {
            throw new Error(
              "Failed to load professors"
            );
          }

          setRooms(
            await roomsResponse.json()
          );

          setAssistants(
            await assistantsResponse.json()
          );

          setProfessors(
            await professorsResponse.json()
          );
        } catch (error) {
          setError(error.message);
        }
      };

    loadReferenceData();
  }, [open]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.date ||
      !form.professor_id
    ) {
      setError(
        "Date and professor are required."
      );
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      date: form.date,
      room_id: form.room_id
        ? Number(form.room_id)
        : null,
      assistant_id:
        form.assistant_id
          ? Number(
              form.assistant_id
            )
          : null,
      professor_id:
        Number(form.professor_id),
    };

    try {
      const response = await fetch(
        `${API}/secretariat/api/exams/${exam.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update exam"
        );
      }

      await onSave();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
    >
      <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-4">
          Edit Exam
        </Dialog.Title>

        {error && (
          <div className="text-red-600 mb-3">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <label>
            <span className="block text-sm font-medium mb-1">
              Date and Time
            </span>

            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </label>

          <label>
            <span className="block text-sm font-medium mb-1">
              Professor
            </span>

            <select
              name="professor_id"
              value={
                form.professor_id
              }
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">
                Select Professor
              </option>

              {professors.map(
                (professor) => (
                  <option
                    key={professor.id}
                    value={professor.id}
                  >
                    {
                      professor.firstName
                    }{" "}
                    {
                      professor.lastName
                    }
                    {professor.departmentName
                      ? ` - ${professor.departmentName}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span className="block text-sm font-medium mb-1">
              Room
            </span>

            <select
              name="room_id"
              value={form.room_id}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">
                No Room Assigned
              </option>

              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.name}
                  {room.buildingName
                    ? ` (${room.buildingName})`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="block text-sm font-medium mb-1">
              Assistant
            </span>

            <select
              name="assistant_id"
              value={
                form.assistant_id
              }
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">
                No Assistant
              </option>

              {assistants.map(
                (assistant) => (
                  <option
                    key={assistant.id}
                    value={assistant.id}
                  >
                    {
                      assistant.firstName
                    }{" "}
                    {
                      assistant.lastName
                    }
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
    </Dialog>
  );
}

function SecretariatEditExam() {
  const navigate = useNavigate();

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedExam, setSelectedExam] =
    useState(null);

  const loadExams =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API}/secretariat/api/exams`,
          {
            credentials: "include",
          }
        );

        const data = await response
          .json()
          .catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load exams"
          );
        }

        setExams(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this exam?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/secretariat/api/exams/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.detail ||
            "Failed to delete exam"
        );
      }

      setExams((previous) =>
        previous.filter(
          (exam) => exam.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
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

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() =>
            navigate(
              "/secretariat/exams"
            )
          }
          className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft
            className="mr-2"
            size={20}
          />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-5">
          Exam Management
        </h1>

        {error && (
          <div className="text-red-600 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-gray-500">
            No exams found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">
                    Group
                  </th>

                  <th className="px-3 py-2">
                    Subject
                  </th>

                  <th className="px-3 py-2">
                    Professor
                  </th>

                  <th className="px-3 py-2">
                    Room
                  </th>

                  <th className="px-3 py-2">
                    Date
                  </th>

                  <th className="px-3 py-2">
                    Duration
                  </th>

                  <th className="px-3 py-2">
                    Assistant
                  </th>

                  <th className="px-3 py-2">
                    Status
                  </th>

                  <th className="px-3 py-2">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">
                      {
                        exam.subject
                          .subgroup
                          .groupName
                      }
                      {
                        exam.subject
                          .subgroup
                          .subgroupIndex
                      }
                    </td>

                    <td className="px-3 py-2">
                      {
                        exam.subject
                          .topic
                      }
                    </td>

                    <td className="px-3 py-2">
                      {exam.professor
                        ? `${exam.professor.firstName} ${exam.professor.lastName}`
                        : "—"}
                    </td>

                    <td className="px-3 py-2">
                      {exam.room?.name ||
                        "—"}
                    </td>

                    <td className="px-3 py-2">
                      {new Date(
                        exam.date
                      ).toLocaleString(
                        "en-GB"
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {exam.duration}h
                    </td>

                    <td className="px-3 py-2">
                      {exam.assistant
                        ? `${exam.assistant.firstName} ${exam.assistant.lastName}`
                        : "—"}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          exam.status ===
                          "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExam(
                              exam
                            );

                            setModalOpen(
                              true
                            );
                          }}
                          className="text-blue-600"
                        >
                          <Pencil
                            size={18}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              exam.id
                            )
                          }
                          className="text-red-600"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && selectedExam && (
        <EditExamModal
          open={modalOpen}
          exam={selectedExam}
          onSave={loadExams}
          onClose={() => {
            setModalOpen(false);
            setSelectedExam(null);
          }}
        />
      )}
    </div>
  );
}

export default SecretariatEditExam;