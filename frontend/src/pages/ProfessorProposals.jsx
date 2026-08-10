import React, { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfessorProposals() {
  const [proposals, setProposals] = useState([]);
  const [availableAssistants, setAvailableAssistants] = useState({});
  const [availableRooms, setAvailableRooms] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const CLOSE_HOUR = 20;

  const handleLogout = async () => {
    localStorage.removeItem("token");

    await fetch("http://localhost:8000/logout", {
      credentials: "include",
    });

    navigate("/login");
  };

  useEffect(() => {
    fetch("http://localhost:8000/professor/proposals/json", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load exam proposals");
        }

        return response.json();
      })
      .then((data) => {
        setProposals(data.proposals || []);
        setAvailableAssistants(data.available_assistants || {});
        setAvailableRooms(data.available_rooms || {});
      })
      .catch((error) => {
        console.error("Failed to load proposals:", error);
        setError("Failed to load exam proposals.");
      });
  }, []);

  const handleAccept = async (event, proposalId) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch(
        "http://localhost:8000/professor/proposals/accept",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "Failed to accept the proposal"
        );
      }

      setProposals((previous) =>
        previous.filter((proposal) => proposal.id !== proposalId)
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleReject = async (event, proposalId) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch(
        "http://localhost:8000/professor/proposals/reject",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "Failed to reject the proposal"
        );
      }

      setProposals((previous) =>
        previous.filter((proposal) => proposal.id !== proposalId)
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 relative">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>

      <div className="flex justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => navigate("/professor")}
            className="mb-4 flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold mb-4">
            Exam Proposals
          </h1>

          {error && (
            <p className="mb-4 text-red-600">
              {error}
            </p>
          )}

          {proposals.length === 0 ? (
            <p className="text-gray-600">
              There are no proposals awaiting review.
            </p>
          ) : (
            <ul className="space-y-8">
              {proposals.map((proposal) => {
                const start = new Date(proposal.date);
                const startHour = start.getHours();

                const maxDuration = Math.min(
                  3,
                  CLOSE_HOUR - startHour
                );

                if (maxDuration < 1) {
                  return (
                    <li
                      key={proposal.id}
                      className="bg-white p-6 rounded-lg shadow"
                    >
                      <p>
                        The exam scheduled at {startHour}:00
                        cannot be accepted because it would end
                        after {CLOSE_HOUR}:00.
                      </p>
                    </li>
                  );
                }

                const durations = Array.from(
                  { length: maxDuration },
                  (_, index) => index + 1
                );

                const subgroup = proposal.subject.subgroup;

                return (
                  <li
                    key={proposal.id}
                    className="bg-white p-6 rounded-lg shadow"
                  >
                    <p>
                      <strong>Subject:</strong>{" "}
                      {proposal.subject.topic}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {start.toLocaleDateString("en-GB")}{" "}
                      <strong>Time:</strong>{" "}
                      <em>
                        {start.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </em>
                    </p>

                    <p>
                      <strong>Study year:</strong>{" "}
                      {subgroup.studyYear}
                    </p>

                    <p>
                      <strong>Group:</strong>{" "}
                      {subgroup.groupName}
                      {subgroup.subgroupIndex}
                    </p>

                    <form
                      onSubmit={(event) =>
                        handleAccept(event, proposal.id)
                      }
                      className="mt-4 flex flex-wrap items-end gap-4"
                    >
                      <input
                        type="hidden"
                        name="proposal_id"
                        value={proposal.id}
                      />

                      <label className="flex flex-col">
                        <span className="font-medium">
                          Assistant:
                        </span>

                        <select
                          name="assistant_id"
                          required
                          className="mt-1 p-2 border rounded"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select assistant
                          </option>

                          {availableAssistants[proposal.id]?.length > 0 ? (
                            availableAssistants[proposal.id].map(
                              (assistant) => (
                                <option
                                  key={assistant.id}
                                  value={assistant.id}
                                >
                                  {assistant.firstName}{" "}
                                  {assistant.lastName}
                                </option>
                              )
                            )
                          ) : (
                            <option disabled>
                              No assistants available
                            </option>
                          )}
                        </select>
                      </label>

                      <label className="flex flex-col">
                        <span className="font-medium">
                          Duration:
                        </span>

                        <select
                          name="duration"
                          defaultValue={durations[0]}
                          className="mt-1 p-2 border rounded"
                        >
                          {durations.map((duration) => (
                            <option
                              key={duration}
                              value={duration}
                            >
                              {duration}{" "}
                              {duration === 1
                                ? "hour"
                                : "hours"}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col">
                        <span className="font-medium">
                          Room:
                        </span>

                        <select
                          name="room_id"
                          required
                          className="mt-1 p-2 border rounded"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select room
                          </option>

                          {availableRooms[proposal.id]?.length > 0 ? (
                            availableRooms[proposal.id].map(
                              (room) => (
                                <option
                                  key={room.id}
                                  value={room.id}
                                >
                                  {room.name}
                                </option>
                              )
                            )
                          ) : (
                            <option disabled>
                              No rooms available
                            </option>
                          )}
                        </select>
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Accept
                      </button>
                    </form>

                    <form
                      onSubmit={(event) =>
                        handleReject(event, proposal.id)
                      }
                      className="mt-4 flex items-end gap-4"
                    >
                      <input
                        type="hidden"
                        name="proposal_id"
                        value={proposal.id}
                      />

                      <label className="flex flex-col">
                        <span className="font-medium">
                          Rejection reason:
                        </span>

                        <input
                          type="text"
                          name="reason"
                          required
                          placeholder="e.g. unsuitable date"
                          className="mt-1 p-2 border rounded w-64"
                        />
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Reject
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessorProposals;