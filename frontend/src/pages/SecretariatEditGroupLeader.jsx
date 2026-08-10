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

function GroupLeaderEditModal({
  open,
  onClose,
  groupLeader,
  subgroups,
  onSave,
}) {
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    emailAddress: "",
    phoneNumber: "",
    subgroup_id: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!groupLeader) {
      return;
    }

    setForm({
      lastName:
        groupLeader.lastName || "",
      firstName:
        groupLeader.firstName || "",
      emailAddress:
        groupLeader.emailAddress || "",
      phoneNumber:
        groupLeader.phoneNumber || "",
      subgroup_id:
        groupLeader.subgroup_id || "",
    });

    setError("");
  }, [groupLeader]);

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
      !form.lastName.trim() ||
      !form.firstName.trim() ||
      !form.emailAddress.trim() ||
      !form.subgroup_id
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/secretariat/api/group-leaders/${groupLeader.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            lastName:
              form.lastName.trim(),
            firstName:
              form.firstName.trim(),
            emailAddress:
              form.emailAddress.trim(),
            phoneNumber:
              form.phoneNumber.trim(),
            subgroup_id: Number(
              form.subgroup_id
            ),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update group leader"
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
          Edit Group Leader
        </Dialog.Title>

        {error && (
          <div className="text-red-600 mb-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="border p-2 rounded"
          />

          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="border p-2 rounded"
          />

          <input
            type="email"
            name="emailAddress"
            value={form.emailAddress}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded col-span-2"
          />

          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border p-2 rounded col-span-2"
          />

          <select
            name="subgroup_id"
            value={form.subgroup_id}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          >
            <option value="">
              Select subgroup
            </option>

            {subgroups.map(
              (subgroup) => (
                <option
                  key={subgroup.id}
                  value={subgroup.id}
                >
                  Year{" "}
                  {subgroup.studyYear} -{" "}
                  {subgroup.groupName}
                  {
                    subgroup.subgroupIndex
                  }
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

function SecretariatEditGroupLeader() {
  const navigate = useNavigate();

  const [groupLeaders, setGroupLeaders] =
    useState([]);

  const [subgroups, setSubgroups] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    selectedGroupLeader,
    setSelectedGroupLeader,
  ] = useState(null);

  const [message, setMessage] =
    useState(null);

  const [newGroupLeader, setNewGroupLeader] =
    useState({
      lastName: "",
      firstName: "",
      emailAddress: "",
      phoneNumber: "",
      subgroup_id: "",
    });

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

  const loadData =
    useCallback(async () => {
      try {
        const [
          leadersResponse,
          subgroupsResponse,
        ] = await Promise.all([
          fetch(
            `${API}/secretariat/api/group-leaders`,
            {
              credentials:
                "include",
            }
          ),

          fetch(
            `${API}/secretariat/api/subgroups`,
            {
              credentials:
                "include",
            }
          ),
        ]);

        if (!leadersResponse.ok) {
          throw new Error(
            "Failed to load group leaders"
          );
        }

        if (!subgroupsResponse.ok) {
          throw new Error(
            "Failed to load subgroups"
          );
        }

        setGroupLeaders(
          await leadersResponse.json()
        );

        setSubgroups(
          await subgroupsResponse.json()
        );
      } catch (error) {
        showMessage(
          error.message,
          "error"
        );
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleCreate = async (
    event
  ) => {
    event.preventDefault();

    if (
      !newGroupLeader.lastName.trim() ||
      !newGroupLeader.firstName.trim() ||
      !newGroupLeader.emailAddress.trim() ||
      !newGroupLeader.subgroup_id
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );

      return;
    }

    try {
      const response = await fetch(
        `${API}/secretariat/api/group-leaders`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            lastName:
              newGroupLeader.lastName.trim(),
            firstName:
              newGroupLeader.firstName.trim(),
            emailAddress:
              newGroupLeader.emailAddress.trim(),
            phoneNumber:
              newGroupLeader.phoneNumber.trim(),
            subgroup_id: Number(
              newGroupLeader.subgroup_id
            ),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to add group leader"
        );
      }

      setNewGroupLeader({
        lastName: "",
        firstName: "",
        emailAddress: "",
        phoneNumber: "",
        subgroup_id: "",
      });

      showMessage(
        "Group leader added successfully."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this group leader?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/secretariat/api/group-leaders/${id}`,
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
            "Failed to delete group leader"
        );
      }

      showMessage(
        "Group leader deleted successfully."
      );

      await loadData();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    }
  };

  const filtered =
    groupLeaders.filter((leader) => {
      const query =
        searchQuery.toLowerCase();

      return (
        leader.lastName
          ?.toLowerCase()
          .includes(query) ||
        leader.firstName
          ?.toLowerCase()
          .includes(query) ||
        leader.emailAddress
          ?.toLowerCase()
          .includes(query) ||
        leader.groupName
          ?.toLowerCase()
          .includes(query)
      );
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length /
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

  const current =
    filtered.slice(
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

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() =>
            navigate(
              "/secretariat/group-leaders"
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
            className={`mb-4 p-3 rounded ${
              message.type ===
              "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-5">
          Group Leader Management
        </h1>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-6"
        >
          <input
            className="border p-2 rounded"
            placeholder="Last Name"
            value={
              newGroupLeader.lastName
            }
            onChange={(event) =>
              setNewGroupLeader({
                ...newGroupLeader,
                lastName:
                  event.target.value,
              })
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="First Name"
            value={
              newGroupLeader.firstName
            }
            onChange={(event) =>
              setNewGroupLeader({
                ...newGroupLeader,
                firstName:
                  event.target.value,
              })
            }
            required
          />

          <input
            type="email"
            className="border p-2 rounded"
            placeholder="Email"
            value={
              newGroupLeader.emailAddress
            }
            onChange={(event) =>
              setNewGroupLeader({
                ...newGroupLeader,
                emailAddress:
                  event.target.value,
              })
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Phone"
            value={
              newGroupLeader.phoneNumber
            }
            onChange={(event) =>
              setNewGroupLeader({
                ...newGroupLeader,
                phoneNumber:
                  event.target.value,
              })
            }
          />

          <select
            value={
              newGroupLeader.subgroup_id
            }
            onChange={(event) =>
              setNewGroupLeader({
                ...newGroupLeader,
                subgroup_id:
                  event.target.value,
              })
            }
            className="border p-2 rounded"
            required
          >
            <option value="">
              Select Subgroup
            </option>

            {subgroups.map(
              (subgroup) => (
                <option
                  key={subgroup.id}
                  value={subgroup.id}
                >
                  Year{" "}
                  {subgroup.studyYear} -{" "}
                  {subgroup.groupName}
                  {
                    subgroup.subgroupIndex
                  }
                </option>
              )
            )}
          </select>

          <button
            type="submit"
            className="bg-green-600 text-white rounded px-3 flex items-center justify-center"
          >
            <Plus
              size={18}
              className="mr-1"
            />
            Add
          </button>
        </form>

        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(
              event.target.value
            );

            setCurrentPage(1);
          }}
          placeholder="Search by name, email or group..."
          className="border p-2 rounded w-full mb-4"
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">
                  Last Name
                </th>
                <th className="px-3 py-2">
                  First Name
                </th>
                <th className="px-3 py-2">
                  Email
                </th>
                <th className="px-3 py-2">
                  Phone
                </th>
                <th className="px-3 py-2">
                  Group
                </th>
                <th className="px-3 py-2">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {current.map(
                (leader) => (
                  <tr
                    key={leader.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">
                      {leader.lastName}
                    </td>

                    <td className="px-3 py-2">
                      {leader.firstName}
                    </td>

                    <td className="px-3 py-2">
                      {leader.emailAddress}
                    </td>

                    <td className="px-3 py-2">
                      {leader.phoneNumber ||
                        "—"}
                    </td>

                    <td className="px-3 py-2">
                      Year{" "}
                      {leader.studyYear ??
                        "—"}{" "}
                      -{" "}
                      {leader.groupName ||
                        ""}
                      {leader.subgroupIndex ||
                        ""}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGroupLeader(
                              leader
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
                              leader.id
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

        <div className="flex justify-between mt-5">
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

      {modalOpen &&
        selectedGroupLeader && (
          <GroupLeaderEditModal
            open={modalOpen}
            groupLeader={
              selectedGroupLeader
            }
            subgroups={subgroups}
            onSave={loadData}
            onClose={() => {
              setModalOpen(false);
              setSelectedGroupLeader(
                null
              );
            }}
          />
        )}
    </div>
  );
}

export default SecretariatEditGroupLeader;