import React, {
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function GroupLeaderSubjectStatus() {
  const [statusData, setStatusData] = useState({
    accepted: [],
    submitted: [],
    rejected: [],
    unsubmitted: [],
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
      "http://localhost:8000/api/group-leader/subject-status",
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load subject status"
          );
        }

        return response.json();
      })
      .then((data) => {
        setStatusData({
          accepted: data.accepted || [],
          submitted: data.submitted || [],
          rejected: data.rejected || [],
          unsubmitted: data.unsubmitted || [],
        });
      })
      .catch((error) => {
        console.error(
          "Failed to load subject status:",
          error
        );
      });
  }, []);

  const SubjectCard = ({ subject }) => {
    let formattedDateTime = "";

    if (subject.examDate) {
      formattedDateTime = new Date(
        subject.examDate
      ).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }

    return (
      <div className="bg-white shadow rounded-lg p-4 border">
        <h4 className="font-semibold text-gray-800">
          {subject.subjectName}
        </h4>

        <p className="text-gray-600 text-sm">
          <strong>Year:</strong>{" "}
          {subject.year}
          {" | "}
          <strong>Group:</strong>{" "}
          {subject.group}
        </p>

        {formattedDateTime && (
          <p className="text-gray-600 text-sm mt-1">
            <strong>Exam date:</strong>{" "}
            {formattedDateTime}
          </p>
        )}

        {subject.duration !== undefined && (
          <p className="text-gray-600 text-sm mt-1">
            <strong>Duration:</strong>{" "}
            {subject.duration}{" "}
            {subject.duration === 1
              ? "hour"
              : "hours"}
          </p>
        )}

        {subject.rejectionReason && (
          <p className="text-red-600 text-sm mt-1">
            <strong>Rejection reason:</strong>{" "}
            {subject.rejectionReason}
          </p>
        )}
      </div>
    );
  };

  const Section = ({
    title,
    subjects,
    titleClass,
  }) => (
    <div>
      <h2
        className={`text-xl font-semibold mb-3 ${titleClass}`}
      >
        {title}
      </h2>

      <div className="grid gap-4">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
          />
        ))}

        {subjects.length === 0 && (
          <p className="text-gray-500 italic">
            No subjects
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 py-10 px-6">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() =>
            navigate("/group-leader")
          }
          className="mb-4 flex items-center"
        >
          <ArrowLeft
            size={20}
            className="mr-2"
          />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          📋 Subject Status
        </h1>

        <div className="flex justify-center mb-6">
          <a
            href="http://localhost:8000/group-leader/export-excel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">
              📥 Download Excel
            </button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Section
            title="✅ Accepted"
            subjects={statusData.accepted}
            titleClass="text-green-700"
          />

          <Section
            title="⏳ Submitted"
            subjects={statusData.submitted}
            titleClass="text-yellow-700"
          />

          <Section
            title="❌ Rejected"
            subjects={statusData.rejected}
            titleClass="text-red-600"
          />

          <Section
            title="📝 Not Submitted"
            subjects={statusData.unsubmitted}
            titleClass="text-gray-700"
          />
        </div>
      </div>
    </div>
  );
}

export default GroupLeaderSubjectStatus;