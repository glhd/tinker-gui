import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import Root from "./Root.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <div className="antialiased font-mono">
            <Root />
        </div>
    </React.StrictMode>
,
);
