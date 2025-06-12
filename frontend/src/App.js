import React from "react";

import './index-calendar.css';

import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";

import SecretariatDashboard from "./pages/SecretariatDashboard";
import SecretariatSali from "./pages/SecretariatSali";
import SecretariatEditSali from "./pages/SecretariatEditSali";
import SecretariatSefgrupa from "./pages/SecretariatSefgrupa";
import SecretariatSefgrupaEdit from "./pages/SecretariatEditSefgrupa";
import SecretariatDiscipline from "./pages/SecretariatDiscipline";
import SecretariatExamene from "./pages/SecretariatExamene";
import SecretariatExameneEdit from "./pages/SecretariatExameneEdit";
import SecretariatExameneSituatie from "./pages/SecretariatExameneSituatie";

import CadruDashboard from "./pages/CadruDashboard";
import CadruPropuneri from "./pages/CadruPropuneri";
import CadruAsistent from "./pages/CadruAsistent";
import CadruExameneAcceptate from "./pages/CadruExameneAcceptate";

import SefDashboard from "./pages/SefDashboard";
import SefDisciplineStatus from "./pages/SefDisciplineStatus";
import SefPropunere from "./pages/SefPropunere";
import SefCalendar from "./pages/SefCalendar";
import SefSetari from "./pages/SefSetariCont";

import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import AdminFacultati from "./pages/AdminFacultati";
import AdminSecretariat from "./pages/AdminSecretariat";
import AdminCadre from "./pages/AdminCadre";
import AdminSetari from "./pages/AdminSetari";


function App() {
  return (
    <BrowserRouter>
      <Routes>
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/login" element={<Login />} />
<Route path="/secretariat" element={<ProtectedRoute role="secretariat"> <SecretariatDashboard />  </ProtectedRoute>} />
<Route path="/secretariat/sali" element={<ProtectedRoute role="secretariat"> <SecretariatSali />  </ProtectedRoute>} />
<Route path="/secretariat/saliedit" element={<ProtectedRoute role="secretariat"> <SecretariatEditSali />  </ProtectedRoute>} />
<Route path="/secretariat/sefgrupe" element={<ProtectedRoute role="secretariat"> <SecretariatSefgrupa />  </ProtectedRoute>} />
<Route path="/secretariat/sefgrupeedit" element={<ProtectedRoute role="secretariat"> <SecretariatSefgrupaEdit />  </ProtectedRoute>} />
<Route path="/secretariat/discipline" element={<ProtectedRoute role="secretariat"> <SecretariatDiscipline />  </ProtectedRoute>} />
<Route path="/secretariat/examene" element={<ProtectedRoute role="secretariat"> <SecretariatExamene />  </ProtectedRoute>} />
<Route path="/secretariat/examene/editare" element={<ProtectedRoute role="secretariat"> <SecretariatExameneEdit />  </ProtectedRoute>} />
<Route path="/secretariat/examene/situatie" element={<ProtectedRoute role="secretariat"> <SecretariatExameneSituatie />  </ProtectedRoute>} />

<Route path="/cadru" element={<ProtectedRoute role="cadru">  <CadruDashboard />  </ProtectedRoute>} />
<Route path="/cadru/propuneri" element={<ProtectedRoute role="cadru">  <CadruPropuneri />  </ProtectedRoute>} />
<Route path="/cadru/examene-acceptate" element={<ProtectedRoute role="cadru">  <CadruExameneAcceptate />  </ProtectedRoute>} />
<Route path="/cadru/asistent" element={<ProtectedRoute role="cadru">  <CadruAsistent />  </ProtectedRoute>} />

<Route path="/sefgrupa" element={<ProtectedRoute role="sef_grupa"> <SefDashboard /> </ProtectedRoute>} />
<Route path="/sefgrupa/status" element={<ProtectedRoute role="sef_grupa"> <SefDisciplineStatus /> </ProtectedRoute>} />
<Route path="/sefgrupa/propunere" element={<ProtectedRoute role="sef_grupa"> <SefPropunere /> </ProtectedRoute>} />
<Route path="/sefgrupa/calendar" element={<ProtectedRoute role="sef_grupa"> <SefCalendar /> </ProtectedRoute>} />
<Route path="/sefgrupa/setari" element={<ProtectedRoute role="sef_grupa"> <SefSetari /> </ProtectedRoute>} />

<Route path="/admin" element={ <ProtectedRoute role="admin"> <AdminDashboard />  </ProtectedRoute> }/>  
<Route path="/admin/facultati" element={<ProtectedRoute role="admin"> <AdminFacultati /> </ProtectedRoute>} />
<Route path="/admin/cadre" element={<ProtectedRoute role="admin"> <AdminCadre /> </ProtectedRoute>} />
<Route path="/admin/secretariat" element={<ProtectedRoute role="admin"> <AdminSecretariat /> </ProtectedRoute>} />
<Route path="/admin/setari" element={<ProtectedRoute role="admin"> <AdminSetari /> </ProtectedRoute>} />

</Routes>
    </BrowserRouter>
  );
}

export default App;