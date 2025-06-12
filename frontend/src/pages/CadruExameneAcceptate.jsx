import React, { useEffect, useState } from "react";
import { ArrowLeft, Download,LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Import SheetJS for Excel export

export default function CadruExameneAcceptate() {
  const [examene, setExamene] = useState([]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    localStorage.removeItem("token");
    await fetch("http://localhost:8000/logout", { credentials: "include" });
    navigate("/login");
  };

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
    const exportData = examene.map((e) => {
      const dt = new Date(e.data);
      const dataFormatata = dt.toLocaleDateString("ro-RO", { dateStyle: "short" });
      const oraFormatata = dt.toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Grupează grupa și subgroupIndex
      const grupa = `${e.groupName}${e.subgroupIndex}`;
      const an = e.studyYear;
      const asistentNume = e.asistentFirstName
        ? `${e.asistentFirstName} ${e.asistentLastName}`
        : "";

      return {
        ID: e.id,
        Disciplina: e.disciplina,
        Grupa: grupa,
        Anul: an,
        Data: dataFormatata,
        Ora: oraFormatata,
        Durata: e.durata,
        Sala: e.sala,
        Asistent: asistentNume,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExameneAcceptate");
    XLSX.writeFile(workbook, `examene_acceptate.xlsx`);
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
        {/* Buton Înapoi */}
        <button onClick={() => navigate('/cadru')} className="mb-4 flex items-center">
          <ArrowLeft size={20} className="mr-2" /> Înapoi
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
                    Grupa
                  </th>
                  <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                    Anul
                  </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Disciplina
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Data
                </th>
                <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                  Ora
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
              {examene.map((e) => {
                  const dt = new Date(e.data);
                  const dataFormatted = dt.toLocaleDateString("ro-RO", {
                    dateStyle: "medium",
                  });
                  const oraFormatted = dt.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const grupa = `${e.groupName}${e.subgroupIndex}`;
                  const an = e.studyYear;

                  return (
                <tr
                      key={e.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="border-b py-3 px-4 text-gray-800">
                        {grupa}
                      </td>
                      <td className="border-b py-3 px-4 text-gray-800">
                        {an}
                      </td>
                      <td className="border-b py-3 px-4 text-gray-800">
                        {e.disciplina}
                      </td>
                      <td className="border-b py-3 px-4 text-gray-800">
                        {dataFormatted}
                      </td>
                      <td className="border-b py-3 px-4 text-gray-800">
                        {oraFormatted}
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
                  );
})}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  );
}
