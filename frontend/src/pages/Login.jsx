import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    window.handleCredentialResponse = (response) => {
      fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
        credentials: "include",
      })
        .then(async (res) => {
          let data = {};
          try {
            data = await res.json();
          } catch {
            throw new Error("Invalid JSON");
          }

          if (!res.ok || !data.rol) {
            throw new Error(data.detail || "Login eșuat");
          }

          switch (data.rol) {
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
              navigate("/admin");
              break;
            default:
              alert("Rol necunoscut");
              navigate("/login");
          }
        })
        .catch((err) => {
          alert("Eroare la login: " + err.message);
        });
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Autentificare cu Google
        </h1>
        <div
          id="g_id_onload"
          data-client_id="916798165835-86eqcj4m9333a8m9idsp5unk2d4cbhge.apps.googleusercontent.com"
          data-context="signin"
          data-callback="handleCredentialResponse"
          data-auto_prompt="false"
        ></div>
        <div className="g_id_signin" data-type="standard" data-size="large"></div>
      <p className="text-sm text-gray-400 mt-6">
          Acces permis doar utilizatorilor validați de instituție.
        </p>
      </div>
    </div>
  );
}

export default Login;
