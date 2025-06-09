import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SefDisciplineStatus() {
  const [statusData, setStatusData] = useState({
    acceptate: [],
    propuse: [],
    respinse: [],
    nepropuse: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/sefgrupa/discipline-status", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setStatusData({
          acceptate: data.acceptate || [],
          propuse: data.trimise || [],
          respinse: data.respinse || [],
          nepropuse: data.netrimise || [],
        });
      })
      .catch((err) =>
        console.error("Eroare la încărcarea disciplinelor:", err)
      );
  }, []);

  const Card = ({ d }) => {
    // Formatăm data și ora examenului, dacă există
    let formattedDateTime = "";
    if (d.dataExamen) {
      const dt = new Date(d.dataExamen);
      formattedDateTime = dt.toLocaleString("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }

    return (
      <div className="bg-white shadow rounded-lg p-4 border">
        <h4 className="font-semibold text-gray-800">{d.numeDisciplina}</h4>
        <p className="text-gray-600 text-sm">
          <strong>An:</strong> {d.an} | <strong>Grupa:</strong> {d.grupa}
        </p>
        {formattedDateTime && (
          <p className="text-gray-600 text-sm mt-1">
            <strong>Data Examen:</strong> {formattedDateTime}
          </p>
        )}
        {d.durata !== undefined && (
          <p className="text-gray-600 text-sm mt-1">
            <strong>Durata:</strong> {d.durata} {d.durata > 1 ? "ore" : "oră"}
          </p>
        )}
        {d.motiv && (
          <p className="text-red-600 text-sm mt-1">
            <strong>Motiv respingere:</strong> {d.motiv}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/sefgrupa")}
          className="mb-6 flex items-center text-blue-700 hover:underline"
        >
          <ArrowLeft className="mr-2" /> Înapoi la dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          📋 Status Discipline
        </h1>

        <div className="flex justify-end mb-6">
          <a
            href="http://localhost:8000/sefgrupa/export-excel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">
              📥 Descarcă Excel
            </button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Acceptate */}
          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-3">
              ✅ Acceptate
            </h2>
            <div className="grid gap-4">
              {statusData.acceptate.map((d) => (
                <Card key={d.id} d={d} />
              ))}
              {statusData.acceptate.length === 0 && (
                <p className="text-gray-500 italic">Nicio disciplină</p>
              )}
            </div>
          </div>

          {/* Propuse (Trimise) */}
          <div>
            <h2 className="text-xl font-semibold text-yellow-700 mb-3">
              ⏳ Propuse
            </h2>
            <div className="grid gap-4">
              {statusData.propuse.map((d) => (
                <Card key={d.id} d={d} />
              ))}
              {statusData.propuse.length === 0 && (
                <p className="text-gray-500 italic">Nicio disciplină</p>
              )}
            </div>
          </div>

          {/* Respinse */}
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              ❌ Respinse
            </h2>
            <div className="grid gap-4">
              {statusData.respinse.map((d) => (
                <Card key={d.id} d={d} />
              ))}
              {statusData.respinse.length === 0 && (
                <p className="text-gray-500 italic">Nicio disciplină</p>
              )}
            </div>
          </div>

          {/* Nepropuse */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              📝 Nepropuse
            </h2>
            <div className="grid gap-4">
              {statusData.nepropuse.map((d) => (
                <Card key={d.id} d={d} />
              ))}
              {statusData.nepropuse.length === 0 && (
                <p className="text-gray-500 italic">Nicio disciplină</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
