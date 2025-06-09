import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function SefCalendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/sefgrupa/examene-acceptate", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((ex) => ({
          title: `${ex.numeDisciplina} - ${ex.sala}`,
          date: ex.data, // format: YYYY-MM-DD
        }));
        setEvents(mapped);
      })
      .catch(() => console.error("Eroare la încărcare examene"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/sefgrupa")}
          className="mb-4 text-blue-700 hover:underline flex items-center"
        >
          <ArrowLeft className="mr-2" /> Înapoi la dashboard
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📅 Calendar Examene</h2>

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
