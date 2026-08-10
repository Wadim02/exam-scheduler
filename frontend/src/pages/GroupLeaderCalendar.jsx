import React, {
  useEffect,
  useState,
} from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function GroupLeaderCalendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "http://localhost:8000/api/group-leader/accepted-exams",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load accepted exams"
          );
        }

        return response.json();
      })
      .then((data) => {
        const calendarEvents = data.map(
          (exam) => ({
            id: exam.id,
            title: `${exam.subject} - ${
              exam.room || "Room not assigned"
            }`,
            start: exam.date,
          })
        );

        setEvents(calendarEvents);
      })
      .catch((error) => {
        console.error(
          "Failed to load calendar:",
          error
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() =>
            navigate("/group-leader")
          }
          className="mb-4 text-blue-700 hover:underline flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📅 Exam Calendar
        </h2>

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
}

export default GroupLeaderCalendar;