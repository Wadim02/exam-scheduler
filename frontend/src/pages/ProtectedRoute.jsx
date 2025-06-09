import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const [authorized, setAuthorized] = React.useState(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetch("http://localhost:8000/me", {
      method: "GET",
      credentials: "include", // AICI E ESENȚIAL
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (role && data.role !== role) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => setAuthorized(false));
  }, [role]);

  if (authorized === null) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
