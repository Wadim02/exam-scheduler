import React from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";

// Secretariat pages
import SecretariatDashboard from "./pages/SecretariatDashboard";
import SecretariatRooms from "./pages/SecretariatRooms";
import SecretariatEditRooms from "./pages/SecretariatEditRooms";
import SecretariatGroupLeaders from "./pages/SecretariatGroupLeaders";
import SecretariatEditGroupLeader from "./pages/SecretariatEditGroupLeader";
import SecretariatSubjects from "./pages/SecretariatSubjects";
import SecretariatExams from "./pages/SecretariatExams";
import SecretariatEditExam from "./pages/SecretariatEditExam";
import SecretariatExamStatus from "./pages/SecretariatExamStatus";

// Professor pages
import ProfessorDashboard from "./pages/ProfessorDashboard";
import ProfessorProposals from "./pages/ProfessorProposals";
import ProfessorAssistantExams from "./pages/ProfessorAssistantExams";
import ProfessorAcceptedExams from "./pages/ProfessorAcceptedExams";

// Group Leader pages
import GroupLeaderDashboard from "./pages/GroupLeaderDashboard";
import GroupLeaderSubjectStatus from "./pages/GroupLeaderSubjectStatus";
import GroupLeaderProposal from "./pages/GroupLeaderProposal";
import GroupLeaderCalendar from "./pages/GroupLeaderCalendar";
import GroupLeaderAccountSettings from "./pages/GroupLeaderAccountSettings";

// Administrator pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminFaculties from "./pages/AdminFaculties";
import AdminSecretariat from "./pages/AdminSecretariat";
import AdminProfessors from "./pages/AdminProfessors";
import AdminSettings from "./pages/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ========================= */}
        {/* Secretariat */}
        {/* ========================= */}

        <Route
          path="/secretariat"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/rooms"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/rooms/edit"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatEditRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/group-leaders"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatGroupLeaders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/group-leaders/edit"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatEditGroupLeader />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/subjects"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatSubjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/exams"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatExams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/exams/edit"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatEditExam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretariat/exams/status"
          element={
            <ProtectedRoute role="secretariat">
              <SecretariatExamStatus />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Professor */}
        {/* ========================= */}

        <Route
          path="/professor"
          element={
            <ProtectedRoute role="professor">
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/proposals"
          element={
            <ProtectedRoute role="professor">
              <ProfessorProposals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/accepted-exams"
          element={
            <ProtectedRoute role="professor">
              <ProfessorAcceptedExams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/assistant-exams"
          element={
            <ProtectedRoute role="professor">
              <ProfessorAssistantExams />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Group Leader */}
        {/* ========================= */}

        <Route
          path="/group-leader"
          element={
            <ProtectedRoute role="group_leader">
              <GroupLeaderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/group-leader/subject-status"
          element={
            <ProtectedRoute role="group_leader">
              <GroupLeaderSubjectStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/group-leader/proposal"
          element={
            <ProtectedRoute role="group_leader">
              <GroupLeaderProposal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/group-leader/calendar"
          element={
            <ProtectedRoute role="group_leader">
              <GroupLeaderCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/group-leader/account-settings"
          element={
            <ProtectedRoute role="group_leader">
              <GroupLeaderAccountSettings />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Administrator */}
        {/* ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/faculties"
          element={
            <ProtectedRoute role="admin">
              <AdminFaculties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/professors"
          element={
            <ProtectedRoute role="admin">
              <AdminProfessors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/secretariat"
          element={
            <ProtectedRoute role="admin">
              <AdminSecretariat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;