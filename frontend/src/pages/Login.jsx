import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check whether the user is already authenticated
    fetch("http://localhost:8000/users/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("User is not authenticated");
        }

        return response.json();
      })
      .then((data) => {
        // Redirect authenticated users according to their role
        switch (data.role) {
          case "secretariat":
            navigate("/secretariat", { replace: true });
            break;

          case "professor":
            navigate("/professor", { replace: true });
            break;

          case "group_leader":
            navigate("/group-leader", { replace: true });
            break;

          case "admin":
            navigate("/admin", { replace: true });
            break;

          default:
            break;
        }
      })
      .catch(() => {
        // User is not authenticated yet
      });

    window.handleCredentialResponse = (response) => {
      fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
        credentials: "include",
      })
        .then(async (response) => {
          let data = {};

          try {
            data = await response.json();
          } catch {
            throw new Error("Invalid server response");
          }

          if (!response.ok || !data.role) {
            throw new Error(data.detail || "Login failed");
          }

          switch (data.role) {
            case "secretariat":
              navigate("/secretariat");
              break;

            case "professor":
              navigate("/professor");
              break;

            case "group_leader":
              navigate("/group-leader");
              break;

            case "admin":
              navigate("/admin");
              break;

            default:
              alert("Unknown user role");
              navigate("/login");
          }
        })
        .catch((error) => {
          alert(`Login error: ${error.message}`);
        });
    };

    const existingScript = document.getElementById(
      "google-identity-services"
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-identity-services";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Sign in with Google
        </h1>

        <div
          id="g_id_onload"
          data-client_id="916798165835-86eqcj4m9333a8m9idsp5unk2d4cbhge.apps.googleusercontent.com"
          data-context="signin"
          data-callback="handleCredentialResponse"
          data-auto_prompt="false"
        />

        <div
          className="g_id_signin"
          data-type="standard"
          data-size="large"
        />

        <p className="text-sm text-gray-400 mt-6">
          Access is restricted to users validated by the institution.
        </p>
      </div>
    </div>
  );
}

export default Login;