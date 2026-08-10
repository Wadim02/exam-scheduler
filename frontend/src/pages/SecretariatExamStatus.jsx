import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

function SecretariatExamStatus() {
  const navigate = useNavigate();

  const [items, setItems] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const pageSize = 50;

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

  const fetchData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams({
            page: String(page),
            page_size:
              String(pageSize),
          });

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        const response = await fetch(
          `${API}/secretariat/api/exams-status?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load exam status"
          );
        }

        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const statusLabel = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";

      case "submitted":
        return "Submitted";

      case "rejected":
        return "Rejected";

      case "not_submitted":
        return "Not Submitted";

      default:
        return status;
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "submitted":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
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

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
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

        <h1 className="text-2xl font-bold mb-4">
          Exam Status
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by subject or subgroup..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );

              setPage(1);
            }}
            className="border p-2 rounded w-full"
          />
        </div>

        {loading && (
          <p>Loading...</p>
        )}

        {error && (
          <p className="text-red-600">
            Error: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow rounded mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2">
                      Subject
                    </th>

                    <th className="px-3 py-2">
                      Subgroup
                    </th>

                    <th className="px-3 py-2">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map(
                    (item) => (
                      <tr
                        key={
                          item.subjectId
                        }
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">
                          {item.topic}
                        </td>

                        <td className="px-3 py-2">
                          {
                            item.subgroup
                              .groupName
                          }
                          {
                            item.subgroup
                              .subgroupIndex
                          }
                        </td>

                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${statusClass(
                              item.status
                            )}`}
                          >
                            {statusLabel(
                              item.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <p className="text-center text-gray-500 mb-4">
                No subjects found.
              </p>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={
                  page >= totalPages
                }
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SecretariatExamStatus;