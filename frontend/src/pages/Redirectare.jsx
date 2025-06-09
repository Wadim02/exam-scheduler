import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Redirectare() {
  const { rol } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    switch (rol) {
      case "secretariat":
        navigate("/secretariat");
        break;
      case "cadru":
        navigate("/cadru/propuneri");
        break;
      case "sef_grupa":
        navigate("/sefgrupa/propunere");
        break;
      case "admin":
        navigate("/admin/facultati");
        break;
      default:
        navigate("/login");
    }
  }, [rol, navigate]);

  return <div>Se redirecționează...</div>;
}

export default Redirectare;
