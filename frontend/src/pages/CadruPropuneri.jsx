// CadruPropuneri.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft,LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CadruPropuneri() {
  const [propuneri, setPropuneri] = useState([]);
  const [asistentiDisponibili, setAsistentiDisponibili] = useState({});
  const [saliDisponibile, setSaliDisponibile] = useState({});
  const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };
  const navigate = useNavigate();

  // ora la care trebuie să fie terminat examenul cel târziu
  const CLOSE_HOUR = 20;

  useEffect(() => {
    fetch('http://localhost:8000/cadru/propuneri/json', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        
        setPropuneri(data.propuneri);
        setAsistentiDisponibili(data.asistenti_disponibili);
        setSaliDisponibile(data.sali_disponibile);
      })
      .catch(err => console.error('Eroare la încărcare JSON:', err));
  }, []);

  const handleAccept = (e, id) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch('http://localhost:8000/cadru/propuneri/accepta', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Eroare la acceptare');
        setPropuneri(prev => prev.filter(p => p.id !== id));
      })
      .catch(console.error);
  };

  const handleReject = (e, id) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch('http://localhost:8000/cadru/propuneri/respinge', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Eroare la respingere');
        setPropuneri(prev => prev.filter(p => p.id !== id));
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 relative">
       {/* Butonul deconectare fixat */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Deconectare
      </button>
      <div className="flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <button onClick={() => navigate('/cadru')} className="mb-4 flex items-center">
          <ArrowLeft size={20} className="mr-2" /> Înapoi
        </button>
      <h1 className="text-3xl font-bold mb-4">Propuneri de examene de confirmat</h1>

      {propuneri.length === 0 ? (
        <p className="text-gray-600">Nu există propuneri de confirmat.</p>
      ) : (
        <ul className="space-y-8">
          {propuneri.map(p => {
            const start = new Date(p.data);
            const startHour = start.getHours();
            // max 3 ore, dar nu să depășească CLOSE_HOUR
            const maxDuration = Math.min(3, CLOSE_HOUR - startHour);
            if (maxDuration < 1) {
              return (
                <li key={p.id} className="bg-white p-6 rounded-lg shadow">
                  <p>
                    Examenul programat la {startHour}:00 nu poate fi confirmat –
                    ora de încheiere ar fi după {CLOSE_HOUR}:00.
                  </p>
                </li>
              );
            }
            const durations = Array.from({ length: maxDuration }, (_, i) => i + 1);

            return (
              <li key={p.id} className="bg-white p-6 rounded-lg shadow">
                <p>
                  <strong>Disciplina:</strong> {p.disciplina.topic}
                </p>
                <p>
 <strong>Data:</strong>{' '}
  {start.toLocaleDateString('ro-RO')} 
  {<b> Ora:</b>}
  <em>{start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</em>
   
 </p>
                <p>
                  <strong>An:</strong> Anul {p.disciplina.subgrupa.studyYear}
                </p>
                <p>
                  <strong>Grupa:</strong> {p.disciplina.subgrupa.groupName}
                  {p.disciplina.subgrupa.subgroupIndex}
                </p>

                <form
                  onSubmit={e => handleAccept(e, p.id)}
                  className="mt-4 flex flex-wrap items-end space-x-4"
                >
                  <input type="hidden" name="id_propunere" value={p.id} />

                  <label className="flex flex-col">
                    <span className="font-medium">Asistent:</span>
                    <select
                      name="id_asistent"
                      required
                      className="mt-1 p-2 border rounded"
                    >
                      {asistentiDisponibili[p.id]?.length > 0 ? (
                        asistentiDisponibili[p.id].map(a => (
                          <option key={a.id} value={a.id}>
                            {a.firstName} {a.lastName}
                          </option>
                        ))
                      ) : (
                        <option disabled>Nu există asistenți disponibili</option>
                      )}
                    </select>
                  </label>

                  <label className="flex flex-col">
                    <span className="font-medium">Durată:</span>
                    <select
                      name="durata"
                      defaultValue={durations[0]}
                      className="mt-1 p-2 border rounded"
                    >
                      {durations.map(d => (
                        <option key={d} value={d}>
                          {d} {d > 1 ? 'ore' : 'oră'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col">
                    <span className="font-medium">Sală:</span>
                    <select
                      name="id_sala"
                      required
                      className="mt-1 p-2 border rounded"
                    >
                      {saliDisponibile[p.id]?.length > 0 ? (
                        saliDisponibile[p.id].map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Nu există săli disponibile</option>
                      )}
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Acceptă
                  </button>
                </form>

                <form
                  onSubmit={e => handleReject(e, p.id)}
                  className="mt-4 flex items-end space-x-4"
                >
                  <input type="hidden" name="id_propunere" value={p.id} />
                  <label className="flex flex-col">
                    <span className="font-medium">Motiv respingere:</span>
                    <input
                      type="text"
                      name="motiv"
                      required
                      placeholder="ex: nepotrivită"
                      className="mt-1 p-2 border rounded w-64"
                    />
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Respinge
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

export default CadruPropuneri;
