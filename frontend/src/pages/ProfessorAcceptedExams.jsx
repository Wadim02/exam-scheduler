import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function ProfessorAcceptedExams() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("token");

    await fetch("http://localhost:8000/logout", {
      credentials: "include",
    });

    navigate("/login");
  };

  useEffect(() => {
    fetch(
      "http://localhost:8000/professor/accepted-exams/json",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load accepted exams");
        }

        return response.json();
      })
      .then((data) => {
        setExams(data.exams || []);
      })
      .catch((error) => {
        console.error(
          "Failed to load accepted exams:",
          error
        );
      });
  }, []);

  const exportToExcel = () => {
    const exportData = exams.map((exam) => {
      const dateTime = new Date(exam.date);

      const formattedDate = dateTime.toLocaleDateString(
        "en-GB",
        {
          dateStyle: "short",
        }
      );

      const formattedTime = dateTime.toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      const group =
        `${exam.groupName}${exam.subgroupIndex}`;

      const assistantName = exam.assistantFirstName
        ? `${exam.assistantFirstName} ${exam.assistantLastName}`
        : "";

      return {
        ID: exam.id,
        Subject: exam.subject,
        Group: group,
        Year: exam.studyYear,
        Date: formattedDate,
        Time: formattedTime,
        "Duration (hours)": exam.duration,
        Room: exam.room || "",
        Assistant: assistantName,
      };
    });

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Accepted Exams"
    );

    XLSX.writeFile(
      workbook,
      "accepted_exams.xlsx"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 relative">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>

      <div className="flex justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => navigate("/professor")}
            className="mb-4 flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Accepted Exams
          </h1>

          {exams.length > 0 && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                <Download className="mr-2" />
                Download Excel
              </button>
            </div>
          )}

          {exams.length === 0 ? (
            <p className="text-center text-gray-600">
              There are currently no accepted exams.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Group
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Year
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Subject
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Date
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Time
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Duration (hours)
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Room
                    </th>
                    <th className="border-b-2 py-3 px-4 text-left text-gray-700">
                      Assistant
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam) => {
                    const dateTime =
                      new Date(exam.date);

                    const formattedDate =
                      dateTime.toLocaleDateString(
                        "en-GB",
                        {
                          dateStyle: "medium",
                        }
                      );

                    const formattedTime =
                      dateTime.toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                    const group =
                      `${exam.groupName}${exam.subgroupIndex}`;

                    return (
                      <tr
                        key={exam.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border-b py-3 px-4 text-gray-800">
                          {group}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {exam.studyYear}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {exam.subject}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {formattedDate}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {formattedTime}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {exam.duration}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {exam.room || "—"}
                        </td>

                        <td className="border-b py-3 px-4 text-gray-800">
                          {exam.assistantFirstName
                            ? `${exam.assistantFirstName} ${exam.assistantLastName}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessorAcceptedExams;