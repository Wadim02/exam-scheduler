import React, { useEffect, useState } from "react";
import { ArrowLeft, Download,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadruAsistent() {
  const [examene, setExamene] = useState([]);
  const [cadru, setCadru] = useState({ firstName: "", lastName: "" });
  const navigate = useNavigate();
  const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };

  useEffect(() => {
    // Presupunem că backend-ul expune un endpoint JSON similar:
    // GET http://localhost:8000/cadru/examene-asistent/json
    fetch("http://localhost:8000/cadru/examene-asistent/json", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la încărcare examene ca asistent");
        return res.json();
      })
      .then((data) => {
        // Structura așteptată: { cadru: { firstName, lastName }, examene: [ ... ] }
        setCadru(data.cadru);
        setExamene(data.examene);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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
        
        {/* Buton Înapoi la Dashboard */}
        <button onClick={() => navigate('/cadru')} className="mb-4 flex items-center">
          <ArrowLeft size={20} className="mr-2" /> Înapoi
        </button>

        {/* Titlu cu numele cadrului */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Examene unde ești asistent – {cadru.firstName} {cadru.lastName}
        </h1>

        {/* Buton centrat pentru export Excel */}
        <div className="mb-6 flex justify-center">
  <a href="http://localhost:8000/cadru/export-excel-asistent" target="_blank" rel="noopener noreferrer">
    <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
      <Download className="mr-2" /> Descarcă Excel
    </button>
  </a>
</div>

        {/* Conținutul listei de examene */}
        {examene.length === 0 ? (
          <p className="text-center text-gray-600">
            Nu ești asistent la niciun examen.
          </p>
        ) : (
          <ul className="space-y-6">
            {examene.map((e) => {
              // Parsează data și formatează corespunzător
              const dt=new Date(e.data);
              
              const dataFormatted = dt.toLocaleDateString("ro-RO", { dateStyle: "medium" });
const oraFormatted  = dt.toLocaleTimeString("ro-RO", {
  hour: "2-digit",
  minute: "2-digit"
});
const formatted     = `${dataFormatted} ${oraFormatted}`;
      const grupa = `${e.groupName}${e.subgroupIndex}`;
      const an = e.studyYear;
      const sala = e.sala ?? "nedefinită";
              return (
                <li
                  key={e.id}
                  className="bg-gray-50 p-6 rounded-lg shadow hover:bg-gray-100 transition-colors"
                >
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {e.disciplina}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Data și ora:</strong> {formatted} ({e.durata}h)
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Grupa:</strong> Anul {an}, {grupa}
                    
                  </p>
                  <p className="text-gray-700">
                    <strong>Sala:</strong> {sala}
                  </p>
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
