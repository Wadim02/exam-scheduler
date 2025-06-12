import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ArrowLeft, Send,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// FullCalendar imports
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import roLocale from "@fullcalendar/core/locales/ro";

export default function SefPropunere() {
  const [discipline, setDiscipline] = useState([]);
  const [disciplineRespinse, setDisciplineRespinse] = useState([]); // nou pentru respinse
  const [selectedId, setSelectedId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [message, setMessage] = useState(null);
  const [events, setEvents] = useState([]);
  const [propuneri, setPropuneri] = useState([]);
  const navigate = useNavigate();
  const [limitStart, setLimitStart] = useState(null);
  const [limitEnd,   setLimitEnd]   = useState(null);
  const [viewRange, setViewRange] = useState({ start: null, end: null });
const [backgroundEvents, setBackgroundEvents] = useState([]);

const handleDatesSet = useCallback(info => {
    const newStart = info.start;
    const newEnd   = info.end;
    
    if (
      !viewRange.start ||
      newStart.getTime() !== viewRange.start.getTime() ||
      newEnd.getTime()   !== viewRange.end.getTime()
    ) {
      setViewRange({ start: newStart, end: newEnd });
    }
  }, [viewRange]);

  useEffect(() => {
    loadDiscipline();
    loadDisciplineRespinse();
    loadEvents();
    loadPropuneri();
    loadLimits();
  }, []);

useEffect(() => {
    const { start, end } = viewRange;
    if (!start || !end || !limitStart || !limitEnd) {
      setBackgroundEvents([]);      return;
    }
    const be = [];
    // înainte de data început
    if (start < limitStart) {
      be.push({
        id: 'beforeLimits',
        start,
        end: limitStart,
        display: 'background',
        color: 'rgba(0,0,0,1)',
      });
    }
    // după data sfârșit
    if (end > limitEnd) {
      be.push({
        id: 'afterLimits',
        start: limitEnd,
        end,
        display: 'background',
        color: 'rgba(0,0,0,1)',
      });
    }
    setBackgroundEvents(be);
  }, [viewRange, limitStart, limitEnd]);

  const combinedEvents = useMemo(
    () => [...events, ...backgroundEvents],
    [events, backgroundEvents]
  );

 function loadLimits() {
    fetch("http://localhost:8000/sefgrupa/limite-examene/json", {
      credentials: "include",
      headers: { Accept: "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
     .then(data => {
        setLimitStart(data.data_inceput ? new Date(data.data_inceput) : null);
        setLimitEnd(  data.data_sfarsit  ? new Date(data.data_sfarsit)  : null);
      })
      .catch(() => {
        console.warn("Nu am putut încărca limitele examenelor");
      });
  }

  function loadDiscipline() {
    fetch("http://localhost:8000/api/sefgrupa/discipline-nepropuse", { credentials: "include" })
      .then(r => r.json())
      .then(setDiscipline)
      .catch(() => setMessage({ text: "Eroare la încărcare discipline.", type: "error" }));
  }

  function loadDisciplineRespinse() {
    fetch("http://localhost:8000/api/sefgrupa/discipline-status", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        // extragem doar lista „respinse” și păstrăm { id, numeDisciplina }
        const respinseSimple = data.respinse.map(d => ({
          id: d.id,
          numeDisciplina: d.numeDisciplina
        }));
        setDisciplineRespinse(respinseSimple);
      })
      .catch(() => setMessage({ text: "Eroare la încărcare discipline respinse.", type: "error" }));
  }

  function loadEvents() {
    fetch("http://localhost:8000/sefgrupa/ocupare-calendar", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setEvents(
          data.map(p => {
            const start = new Date(p.data);
            const end = new Date(start.getTime() + p.durata * 3600 * 1000);
            return {
              id: `${p.disciplina}_${p.data}`,
              title: p.disciplina,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor:
                p.status === "acceptata"
                  ? "green"
                  : p.status === "trimisa"
                  ? "orange"
                  : "red",
            };
          })
        );
      })
      .catch(e => console.error("Calendar load failed", e));
  }

  function loadPropuneri() {
    fetch("http://localhost:8000/sefgrupa/ocupare-calendar", { credentials: "include" })
      .then(r => r.json())
      .then(data => setPropuneri(Array.isArray(data) ? data : []))
      .catch(e => console.error("Failed to load propuneri", e));
  }

  const handleSelect = selInfo => {
    setDatetime(selInfo.startStr);
  };
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedId || !datetime) {
      setMessage({ text: "Completează toate câmpurile!", type: "error" });
      return;
    }
    const payload = { disciplina_id: Number(selectedId), data: datetime, durata: 1 };
    try {
      const res = await fetch("http://localhost:8000/sefgrupa/propunere", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage({ text: "Propunere trimisă cu succes!", type: "success" });
      setSelectedId("");
      setDatetime("");
      loadDiscipline();
      loadDisciplineRespinse();
      loadEvents();
      loadPropuneri();
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || "Eroare la trimitere", type: "error" });
    }
  };

  // Combină în dropdown disciplinele nepropuse + respinse
  const dropdownOptions = useMemo(() => {
    return [...discipline, ...disciplineRespinse];
  }, [discipline, disciplineRespinse]);

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-r from-blue-100 to-teal-100">
            <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        {message && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow text-white z-50 ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <button onClick={() => navigate('/sefgrupa')} className="mb-4 flex items-center">
          <ArrowLeft size={20} className="mr-2" /> Înapoi
        </button>
        <h1 className="text-2xl font-semibold mb-4">Propune Examen</h1>

        <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Alege o disciplină...</option>
            {dropdownOptions.map(d => (
              <option key={d.id} value={d.id}>
                {d.numeDisciplina}
              </option>
            ))}
          </select>

          <div className="border rounded p-2">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              locale="ro"
              locales={[roLocale]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridWeek,timeGridDay",
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              selectable
              selectMirror
              selectAllow={info => {
                const okHours = info.start.getHours() >= 8 && info.end.getHours() <= 18;
          if (!limitStart || !limitEnd) return okHours;
 
          return okHours && 
            info.start >= limitStart &&
            info.end   <= limitEnd;
        }}
              select={handleSelect}
              events={combinedEvents}
              businessHours={{
   daysOfWeek: [1,2,3,4,5,6],
   startTime: '08:00', endTime: '18:00',
   display: 'inverse-background'
 }}
 datesSet={handleDatesSet}
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              height="auto"
              weekends
            />
            {limitStart && limitEnd && (
        <p className="mt-2 text-sm text-gray-600">
          Perioada de programare:{" "}
          <strong>
            {limitStart.toLocaleDateString("ro-RO")} –{" "}
            {limitEnd.toLocaleDateString("ro-RO")}
         </strong>
        </p>
      )}
            {datetime && (
              <p className="mt-2 text-gray-700">
                Data selectată:{" "}
                {new Date(datetime).toLocaleString("ro-RO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Send className="mr-2" size={18} /> Trimite propunerea
          </button>
        </form>

        {/* Lista de statusuri */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {[
            { key: "acceptata", label: "✅ Acceptate" },
            { key: "respinsa", label: "❌ Respise" },
            { key: "trimisa", label: "⏳ Trimise" },
          ].map(({ key, label }) => (
            <div key={key} className="bg-gray-50 p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">{label}</h2>
              <ul className="list-disc pl-5">
                {propuneri.filter(p => p.status === key).map(p => (
                  <li key={`${p.disciplina}_${p.data}`}>
                    {p.disciplina} –{" "}
                    {new Date(p.data).toLocaleString("ro-RO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </li>
                ))}
                {propuneri.filter(p => p.status === key).length === 0 && (
                  <li className="text-gray-500 italic">Nicio propunere</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
