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
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function RoomEditModal({
  open,
  onClose,
  room,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    buildingName: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!room) {
      return;
    }

    setForm({
      name: room.name || "",
      shortName:
        room.shortName || "",
      buildingName:
        room.buildingName || "",
    });

    setError("");
  }, [room]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError(
        "Room name is required."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/secretariat/api/rooms/${room.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            shortName:
              form.shortName.trim(),
            buildingName:
              form.buildingName.trim(),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update room"
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
      <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-4">
          Edit Room
        </Dialog.Title>

        {error && (
          <div className="text-red-600 mb-3">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Room Name"
            className="border p-2 rounded"
          />

          <input
            name="shortName"
            value={form.shortName}
            onChange={handleChange}
            placeholder="Short Name"
            className="border p-2 rounded"
          />

          <input
            name="buildingName"
            value={form.buildingName}
            onChange={handleChange}
            placeholder="Building Name"
            className="border p-2 rounded"
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
    </Dialog>
  );
}

function SecretariatEditRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedRoom, setSelectedRoom] =
    useState(null);

  const [message, setMessage] =
    useState(null);

  const [newRoom, setNewRoom] =
    useState({
      name: "",
      shortName: "",
      buildingName: "",
    });

  const [loading, setLoading] =
    useState(false);

  const itemsPerPage = 50;

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage({
      text,
      type,
    });

    setTimeout(
      () => setMessage(null),
      4000
    );
  };

  const loadRooms =
    useCallback(async () => {
      try {
        const response = await fetch(
          `${API}/secretariat/api/rooms`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load rooms"
          );
        }

        const data =
          await response.json();

        setRooms(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        showMessage(
          error.message,
          "error"
        );
      }
    }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

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

  const handleAdd = async () => {
    if (!newRoom.name.trim()) {
      showMessage(
        "Room name is required.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/secretariat/api/rooms`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: newRoom.name.trim(),
            shortName:
              newRoom.shortName.trim(),
            buildingName:
              newRoom.buildingName.trim(),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to add room"
        );
      }

      setNewRoom({
        name: "",
        shortName: "",
        buildingName: "",
      });

      showMessage(
        "Room added successfully."
      );

      await loadRooms();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this room?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/secretariat/api/rooms/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete room"
        );
      }

      showMessage(
        "Room deleted successfully."
      );

      await loadRooms();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    }
  };

  const filteredRooms =
    rooms.filter((room) => {
      const query =
        searchQuery.toLowerCase();

      return (
        room.name
          ?.toLowerCase()
          .includes(query) ||
        room.shortName
          ?.toLowerCase()
          .includes(query) ||
        room.buildingName
          ?.toLowerCase()
          .includes(query)
      );
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRooms.length /
        itemsPerPage
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const start =
    (currentPage - 1) *
    itemsPerPage;

  const currentRooms =
    filteredRooms.slice(
      start,
      start + itemsPerPage
    );

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

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() =>
            navigate(
              "/secretariat/rooms"
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

        {message && (
          <div
            className={`mb-4 p-3 rounded shadow ${
              message.type ===
              "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6">
          Room Management
        </h1>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">
            Add New Room
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              className="border px-2 py-2 rounded"
              placeholder="Room Name"
              value={newRoom.name}
              onChange={(event) =>
                setNewRoom({
                  ...newRoom,
                  name: event.target.value,
                })
              }
            />

            <input
              className="border px-2 py-2 rounded"
              placeholder="Short Name"
              value={
                newRoom.shortName
              }
              onChange={(event) =>
                setNewRoom({
                  ...newRoom,
                  shortName:
                    event.target.value,
                })
              }
            />

            <input
              className="border px-2 py-2 rounded"
              placeholder="Building"
              value={
                newRoom.buildingName
              }
              onChange={(event) =>
                setNewRoom({
                  ...newRoom,
                  buildingName:
                    event.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
            >
              <Plus
                className="mr-2"
                size={18}
              />
              Add
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by room name, short name or building..."
          className="w-full mb-4 p-2 border rounded"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(
              event.target.value
            );

            setCurrentPage(1);
          }}
        />

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">
                  ID
                </th>

                <th className="px-4 py-2">
                  Name
                </th>

                <th className="px-4 py-2">
                  Short Name
                </th>

                <th className="px-4 py-2">
                  Building
                </th>

                <th className="px-4 py-2">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentRooms.map(
                (room) => (
                  <tr
                    key={room.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {room.id}
                    </td>

                    <td className="px-4 py-2">
                      {room.name}
                    </td>

                    <td className="px-4 py-2">
                      {room.shortName ||
                        "—"}
                    </td>

                    <td className="px-4 py-2">
                      {room.buildingName ||
                        "—"}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoom(
                              room
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
                              room.id
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
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-5">
          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (page) => page - 1
              )
            }
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {currentPage} of{" "}
            {totalPages}
          </span>

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) => page + 1
              )
            }
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {modalOpen && selectedRoom && (
        <RoomEditModal
          open={modalOpen}
          room={selectedRoom}
          onClose={() => {
            setModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={loadRooms}
        />
      )}
    </div>
  );
}

export default SecretariatEditRooms;