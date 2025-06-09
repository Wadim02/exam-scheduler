import React, { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Import SheetJS for Excel export

export default function CadruExameneAcceptate() {
  const [examene, setExamene] = useState([]);
  const navigate = useNavigate();
  

  useEffect(() => {
    fetch("http://localhost:8000/cadru/examene-acceptate/json", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setExamene(data.examene))
      .catch((err) => {
        console.error("Eroare la încărcare examene acceptate:", err);
      });
  }, []);

  // Funcție pentru exportarea datelor în Excel
  const exportToExcel = () => {
    // Transformăm fiecare examen într-un obiect plat, cu coloanele dorite
    const exportData = examene.map((e) => {
      const dataFormatata = new Date(e.data).toLocaleDateString("ro-RO", {
        dateStyle: "short",
      });
      const asistentNume = e.asistentFirstName
        ? `${e.asistentFirstName} ${e.asistentLastName}`
        : "";

      return {
        ID: e.id,
        Disciplina: e.disciplina,
        Data: dataFormatata,
        Durata: e.durata,
        Sala: e.sala,
        Asistent: asistentNume,
      };
    });

    // Creăm foaia de calcul și registrul de lucru
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExameneAcceptate");

    // Descărcăm fișierul Excel
    XLSX.writeFile(workbook, `examene_acceptate.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        {/* Buton Înapoi */}
        <button
          onClick={() => navigate("/cadru")}
          className="flex items-center text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="mr-2" /> Înapoi la dashboard
        </button>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Examene Acceptate
        </h1>

        {/* Buton pentru descarcarea tabelului în Excel */}
        {examene.length > 0 && (
          <div className="mb-6 flex justify-center">
          <button
            onClick={exportToExcel}
            className="mb-6 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <Download className="mr-2" /> Descarcă în Excel
          </button>
          </div>
        )}

        {examene.length === 0 ? (
          <p className="text-center text-gray-600">
            Nu există examene acceptate momentan.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Disciplina
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Data
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Durată (ore)
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Sală
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Asistent
                </th>
              </tr>
            </thead>
            <tbody>
              {examene.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border-b py-3 px-4 text-gray-800">
                    {e.disciplina}
                  </td>
                  <td className="border-b py-3 px-4 text-gray-800">
                    {new Date(e.data).toLocaleDateString("ro-RO", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="border-b py-3 px-4 text-gray-800">
                    {e.durata}
                  </td>
                  <td className="border-b py-3 px-4 text-gray-800">
                    {e.sala}
                  </td>
                  <td className="border-b py-3 px-4 text-gray-800">
                    {e.asistentFirstName
                      ? `${e.asistentFirstName} ${e.asistentLastName}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
