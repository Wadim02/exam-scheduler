import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  PlusCircle,
  ArrowLeft,
  Pencil,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminProfessorEditModal from "./AdminProfessorEditModal";

const API = "http://localhost:8000";

function AdminProfessors() {
  const [professors, setProfessors] =
    useState([]);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    selectedProfessor,
    setSelectedProfessor,
  ] = useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [newProfessor, setNewProfessor] =
    useState({
      firstName: "",
      lastName: "",
      emailAddress: "",
      phoneNumber: "",
      facultyName: "",
      departmentName: "",
    });

  const [message, setMessage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const itemsPerPage = 50;

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

  const loadProfessors =
    useCallback(async () => {
      try {
        const response = await fetch(
          `${API}/api/admin/faculty-members`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load professors"
          );
        }

        const data =
          await response.json();

        setProfessors(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);

        showMessage(
          "Failed to load professors.",
          "error"
        );
      }
    }, []);

  useEffect(() => {
    loadProfessors();
  }, [loadProfessors]);

  const filteredProfessors =
    professors.filter((professor) => {
      const search =
        searchQuery.toLowerCase();

      return (
        (
          professor.firstName || ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          professor.lastName || ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          professor.emailAddress || ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          professor.facultyName || ""
        )
          .toLowerCase()
          .includes(search) ||
        (
          professor.departmentName || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProfessors.length /
        itemsPerPage
    )
  );

  const indexOfLastItem =
    currentPage * itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;

  const currentProfessors =
    filteredProfessors.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      !newProfessor.firstName.trim() ||
      !newProfessor.lastName.trim() ||
      !newProfessor.emailAddress.trim() ||
      !newProfessor.facultyName.trim() ||
      !newProfessor.departmentName.trim()
    ) {
      showMessage(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    if (
      !validateEmail(
        newProfessor.emailAddress
      )
    ) {
      showMessage(
        "Invalid email address.",
        "error"
      );
      return;
    }

    if (
      !newProfessor.emailAddress
        .toLowerCase()
        .endsWith("@usm.ro")
    ) {
      showMessage(
        "Professor email must use the @usm.ro domain.",
        "error"
      );
      return;
    }

    const formData = new FormData();

    Object.entries(
      newProfessor
    ).forEach(([key, value]) => {
      formData.append(
        key,
        value.trim()
      );
    });

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/add-faculty-member`,
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
            "Failed to add professor"
        );
      }

      setNewProfessor({
        firstName: "",
        lastName: "",
        emailAddress: "",
        phoneNumber: "",
        facultyName: "",
        departmentName: "",
      });

      showMessage(
        "Professor added successfully."
      );

      await loadProfessors();
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
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this professor?"
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/admin/faculty-members/delete/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          data.detail ||
            "Failed to delete professor"
        );
      }

      showMessage(
        "Professor deleted successfully."
      );

      await loadProfessors();
    } catch (error) {
      showMessage(
        error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "firstName",
      placeholder: "First Name",
      required: true,
    },
    {
      name: "lastName",
      placeholder: "Last Name",
      required: true,
    },
    {
      name: "emailAddress",
      placeholder: "Email (@usm.ro)",
      required: true,
      type: "email",
    },
    {
      name: "phoneNumber",
      placeholder: "Phone Number",
      required: false,
    },
    {
      name: "facultyName",
      placeholder: "Faculty",
      required: true,
    },
    {
      name: "departmentName",
      placeholder: "Department",
      required: true,
    },
  ];

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

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, faculty or department..."
            className="w-full p-3 border rounded shadow"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(
                event.target.value
              );

              setCurrentPage(1);
            }}
          />
        </div>

        <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="mr-2" />
          Add Professor
        </h3>

        <form
          onSubmit={handleAdd}
          className="bg-white rounded shadow-lg p-6 mb-10 grid gap-4"
        >
          {fields.map((field) => (
            <input
              key={field.name}
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              className="border rounded p-2"
              value={
                newProfessor[
                  field.name
                ]
              }
              onChange={(event) =>
                setNewProfessor({
                  ...newProfessor,
                  [field.name]:
                    event.target.value,
                })
              }
              disabled={loading}
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center justify-center"
          >
            <PlusCircle className="mr-2" />

            {loading
              ? "Adding..."
              : "Add Professor"}
          </button>
        </form>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Professor Management (@usm.ro)
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
                  Phone
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
              {currentProfessors.map(
                (professor) => (
                  <tr
                    key={professor.id}
                    className="border-b hover:bg-teal-50"
                  >
                    <td className="px-4 py-3">
                      {professor.firstName}
                    </td>

                    <td className="px-4 py-3">
                      {professor.lastName}
                    </td>

                    <td className="px-4 py-3">
                      {
                        professor.emailAddress
                      }
                    </td>

                    <td className="px-4 py-3">
                      {professor.phoneNumber ||
                        "—"}
                    </td>

                    <td className="px-4 py-3">
                      {professor.facultyName}
                    </td>

                    <td className="px-4 py-3">
                      {
                        professor.departmentName
                      }
                    </td>

                    <td className="px-4 py-3 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProfessor(
                            professor
                          );

                          setModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            professor.id
                          )
                        }
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredProfessors.length ===
          0 && (
          <p className="text-center text-gray-500 mt-6">
            No professors found.
          </p>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (previous) =>
                  previous - 1
              )
            }
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Previous Page
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (previous) =>
                  previous + 1
              )
            }
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Next Page
          </button>
        </div>

        {modalOpen &&
          selectedProfessor && (
            <AdminProfessorEditModal
              open={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setSelectedProfessor(
                  null
                );
              }}
              professor={
                selectedProfessor
              }
              onSave={
                loadProfessors
              }
            />
          )}
      </div>
    </div>
  );
}

export default AdminProfessors;