import React, { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadruAsistent() {
  const [examene, setExamene] = useState([]);
  const [cadru, setCadru] = useState({ firstName: "", lastName: "" });
  const navigate = useNavigate();

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
        setCadru({
          firstName: data.cadru.firstName,
          lastName: data.cadru.lastName,
        });
        setExamene(data.examene);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        {/* Buton Înapoi la Dashboard */}
        <button
          onClick={() => navigate("/cadru")}
          className="mb-6 flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-2" /> Înapoi la dashboard
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
              const dateObj = new Date(e.data);
              const dataFormatted = dateObj.toLocaleDateString("ro-RO", {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const studyYear = e.disciplina.subgrupa.studyYear;
              const groupName = e.disciplina.subgrupa.groupName;
              const subgroupIndex = e.disciplina.subgrupa.subgroupIndex;
              const salaName = e.sala ? e.sala.name : "nedefinită";

              return (
                <li
                  key={e.id}
                  className="bg-gray-50 p-6 rounded-lg shadow hover:bg-gray-100 transition-colors"
                >
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {e.disciplina.nume}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Data:</strong> {dataFormatted} ({e.durata}h)
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Grupa:</strong> Anul {studyYear}, {groupName}
                    {subgroupIndex}
                  </p>
                  <p className="text-gray-700">
                    <strong>Sala:</strong> {salaName}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
