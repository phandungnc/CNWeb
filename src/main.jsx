import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Import toàn bộ CSS gốc
import "./assets/css/bootstrap.min.css";
import "./assets/css/file-upload.css";
import "./assets/css/plyr.css";
import "./assets/css/full-calendar.css";
import "./assets/css/jquery-ui.css";
import "./assets/css/editor-quill.css";
import "./assets/css/jquery-jvectormap-2.0.5.css";
import "./assets/css/main.css";

// Tự load JS tĩnh
function loadScripts() {
  const scripts = [
    "/src/assets/js/jquery-3.7.1.min.js",
    "/src/assets/js/bootstrap.bundle.min.js",
    "/src/assets/js/phosphor-icon.js",
    "/src/assets/js/main.js",
  ];

  scripts.forEach((src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.body.appendChild(script);
  });
}
loadScripts();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
