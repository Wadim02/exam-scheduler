import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Send,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function GroupLeaderProposal() {
  const [subjects, setSubjects] = useState([]);
  const [rejectedSubjects, setRejectedSubjects] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [dateTime, setDateTime] =
    useState("");

  const [message, setMessage] =
    useState(null);

  const [events, setEvents] =
    useState([]);

  const [proposals, setProposals] =
    useState([]);

  const [limitStart, setLimitStart] =
    useState(null);

  const [limitEnd, setLimitEnd] =
    useState(null);

  const [viewRange, setViewRange] = useState({
    start: null,
    end: null,
  });

  const [backgroundEvents, setBackgroundEvents] =
    useState([]);

  const navigate = useNavigate();

  const handleDatesSet = useCallback(
    (info) => {
      const newStart = info.start;
      const newEnd = info.end;

      if (
        !viewRange.start ||
        newStart.getTime() !==
          viewRange.start.getTime() ||
        newEnd.getTime() !==
          viewRange.end.getTime()
      ) {
        setViewRange({
          start: newStart,
          end: newEnd,
        });
      }
    },
    [viewRange]
  );

  const loadLimits = useCallback(() => {
    fetch(
      "http://localhost:8000/group-leader/exam-limits/json",
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load exam limits"
          );
        }

        return response.json();
      })
      .then((data) => {
        setLimitStart(
          data.start_date
            ? new Date(data.start_date)
            : null
        );

        setLimitEnd(
          data.end_date
            ? new Date(data.end_date)
            : null
        );
      })
      .catch((error) => {
        console.warn(
          "Failed to load exam limits:",
          error
        );
      });
  }, []);

  const loadSubjects = useCallback(() => {
    fetch(
      "http://localhost:8000/api/group-leader/unproposed-subjects",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load subjects"
          );
        }

        return response.json();
      })
      .then((data) => {
        setSubjects(
          Array.isArray(data) ? data : []
        );
      })
      .catch(() => {
        setMessage({
          text: "Failed to load subjects.",
          type: "error",
        });
      });
  }, []);

  const loadRejectedSubjects =
    useCallback(() => {
      fetch(
        "http://localhost:8000/api/group-leader/subject-status",
        {
          credentials: "include",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Failed to load rejected subjects"
            );
          }

          return response.json();
        })
        .then((data) => {
          const rejected = (
            data.rejected || []
          ).map((subject) => ({
            id: subject.id,
            subjectName:
              subject.subjectName,
          }));

          setRejectedSubjects(rejected);
        })
        .catch(() => {
          setMessage({
            text: "Failed to load rejected subjects.",
            type: "error",
          });
        });
    }, []);

  const loadEvents = useCallback(() => {
    fetch(
      "http://localhost:8000/group-leader/calendar-occupancy",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load calendar"
          );
        }

        return response.json();
      })
      .then((data) => {
        const calendarEvents = data.map(
          (proposal) => {
            const start = new Date(
              proposal.date
            );

            const end = new Date(
              start.getTime() +
                proposal.duration *
                  60 *
                  60 *
                  1000
            );

            let backgroundColor =
              "red";

            if (
              proposal.status === "accepted"
            ) {
              backgroundColor = "green";
            } else if (
              proposal.status === "submitted"
            ) {
              backgroundColor = "orange";
            }

            return {
              id: `${proposal.subject}_${proposal.date}`,
              title: proposal.subject,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor,
            };
          }
        );

        setEvents(calendarEvents);
        setProposals(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        console.error(
          "Failed to load calendar:",
          error
        );
      });
  }, []);

  useEffect(() => {
    loadSubjects();
    loadRejectedSubjects();
    loadEvents();
    loadLimits();
  }, [
    loadSubjects,
    loadRejectedSubjects,
    loadEvents,
    loadLimits,
  ]);

  useEffect(() => {
    const {
      start,
      end,
    } = viewRange;

    if (
      !start ||
      !end ||
      !limitStart ||
      !limitEnd
    ) {
      setBackgroundEvents([]);
      return;
    }

    const background = [];

    if (start < limitStart) {
      background.push({
        id: "beforeLimits",
        start,
        end: limitStart,
        display: "background",
        color: "rgba(0,0,0,1)",
      });
    }

    if (end > limitEnd) {
      background.push({
        id: "afterLimits",
        start: limitEnd,
        end,
        display: "background",
        color: "rgba(0,0,0,1)",
      });
    }

    setBackgroundEvents(background);
  }, [
    viewRange,
    limitStart,
    limitEnd,
  ]);

  const combinedEvents = useMemo(
    () => [
      ...events,
      ...backgroundEvents,
    ],
    [events, backgroundEvents]
  );

  const dropdownOptions = useMemo(
    () => {
      const combined = [
        ...subjects,
        ...rejectedSubjects,
      ];

      return combined.filter(
        (subject, index, array) =>
          array.findIndex(
            (item) =>
              item.id === subject.id
          ) === index
      );
    },
    [subjects, rejectedSubjects]
  );

  const handleSelect = (selectionInfo) => {
    setDateTime(
      selectionInfo.startStr
    );
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");

    await fetch(
      "http://localhost:8000/logout",
      {
        credentials: "include",
      }
    );

    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId || !dateTime) {
      setMessage({
        text: "Please complete all fields.",
        type: "error",
      });

      return;
    }

    const payload = {
      subject_id: Number(selectedId),
      date: dateTime,
      duration: 1,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/group-leader/proposal",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to submit proposal"
        );
      }

      setMessage({
        text:
          data.message ||
          "Proposal submitted successfully.",
        type: "success",
      });

      setSelectedId("");
      setDateTime("");

      loadSubjects();
      loadRejectedSubjects();
      loadEvents();
    } catch (error) {
      console.error(error);

      setMessage({
        text:
          error.message ||
          "Failed to submit proposal.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-r from-blue-100 to-teal-100">
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

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
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

        <button
          onClick={() =>
            navigate("/group-leader")
          }
          className="mb-4 flex items-center"
        >
          <ArrowLeft
            size={20}
            className="mr-2"
          />
          Back
        </button>

        <h1 className="text-2xl font-semibold mb-4">
          Propose Exam
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 mb-6"
        >
          <select
            value={selectedId}
            onChange={(event) =>
              setSelectedId(
                event.target.value
              )
            }
            className="border p-2 rounded"
          >
            <option value="">
              Select a subject...
            </option>

            {dropdownOptions.map(
              (subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.subjectName}
                </option>
              )
            )}
          </select>

          <div className="border rounded p-2">
            <FullCalendar
              plugins={[
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "timeGridWeek,timeGridDay",
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              selectable
              selectMirror
              selectAllow={(info) => {
                const validHours =
                  info.start.getHours() >= 8 &&
                  info.end.getHours() <= 18;

                if (
                  !limitStart ||
                  !limitEnd
                ) {
                  return validHours;
                }

                return (
                  validHours &&
                  info.start >= limitStart &&
                  info.end <= limitEnd
                );
              }}
              select={handleSelect}
              events={combinedEvents}
              businessHours={{
                daysOfWeek: [
                  1, 2, 3, 4, 5, 6,
                ],
                startTime: "08:00",
                endTime: "18:00",
                display:
                  "inverse-background",
              }}
              datesSet={handleDatesSet}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              height="auto"
              weekends
            />

            {limitStart &&
              limitEnd && (
                <p className="mt-2 text-sm text-gray-600">
                  Scheduling period:{" "}
                  <strong>
                    {limitStart.toLocaleDateString(
                      "en-GB"
                    )}{" "}
                    –{" "}
                    {limitEnd.toLocaleDateString(
                      "en-GB"
                    )}
                  </strong>
                </p>
              )}

            {dateTime && (
              <p className="mt-2 text-gray-700">
                Selected date:{" "}
                {new Date(
                  dateTime
                ).toLocaleString(
                  "en-GB",
                  {
                    dateStyle:
                      "medium",
                    timeStyle:
                      "short",
                  }
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Send
              className="mr-2"
              size={18}
            />
            Submit Proposal
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            {
              key: "accepted",
              label: "✅ Accepted",
            },
            {
              key: "rejected",
              label: "❌ Rejected",
            },
            {
              key: "submitted",
              label: "⏳ Submitted",
            },
          ].map(
            ({
              key,
              label,
            }) => {
              const filtered =
                proposals.filter(
                  (proposal) =>
                    proposal.status === key
                );

              return (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded"
                >
                  <h2 className="text-lg font-semibold mb-2">
                    {label}
                  </h2>

                  <ul className="list-disc pl-5">
                    {filtered.map(
                      (proposal) => (
                        <li
                          key={`${proposal.subject}_${proposal.date}`}
                        >
                          {
                            proposal.subject
                          }{" "}
                          –{" "}
                          {new Date(
                            proposal.date
                          ).toLocaleString(
                            "en-GB",
                            {
                              dateStyle:
                                "short",
                              timeStyle:
                                "short",
                            }
                          )}
                        </li>
                      )
                    )}

                    {filtered.length ===
                      0 && (
                      <li className="text-gray-500 italic">
                        No proposals
                      </li>
                    )}
                  </ul>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupLeaderProposal;