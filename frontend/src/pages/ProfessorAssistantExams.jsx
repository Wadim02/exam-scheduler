import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfessorAssistantExams() {
  const [exams, setExams] = useState([]);
  const [professor, setProfessor] = useState({
    firstName: "",
    lastName: "",
  });

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
      "http://localhost:8000/professor/assistant-exams/json",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load assistant exams"
          );
        }

        return response.json();
      })
      .then((data) => {
        setProfessor(
          data.professor || {
            firstName: "",
            lastName: "",
          }
        );

        setExams(data.exams || []);
      })
      .catch((error) => {
        console.error(
          "Failed to load assistant exams:",
          error
        );
      });
  }, []);

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
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => navigate("/professor")}
            className="mb-4 flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Exams Where You Are an Assistant
          </h1>

          <p className="text-center text-gray-600 mb-6">
            {professor.firstName} {professor.lastName}
          </p>

          <div className="mb-6 flex justify-center">
            <a
              href="http://localhost:8000/professor/export-excel-assistant"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                <Download className="mr-2" />
                Download Excel
              </button>
            </a>
          </div>

          {exams.length === 0 ? (
            <p className="text-center text-gray-600">
              You are not assigned as an assistant to any
              exams.
            </p>
          ) : (
            <ul className="space-y-6">
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

                const formatted =
                  `${formattedDate} ${formattedTime}`;

                const group =
                  `${exam.groupName}${exam.subgroupIndex}`;

                const room =
                  exam.room ?? "Not assigned";

                return (
                  <li
                    key={exam.id}
                    className="bg-gray-50 p-6 rounded-lg shadow hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-gray-800 mb-1">
                      {exam.subject}
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Date and time:</strong>{" "}
                      {formatted} ({exam.duration}h)
                    </p>

                    <p className="text-gray-700 mb-1">
                      <strong>Group:</strong>{" "}
                      Year {exam.studyYear}, {group}
                    </p>

                    <p className="text-gray-700">
                      <strong>Room:</strong>{" "}
                      {room}
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

export default ProfessorAssistantExams;