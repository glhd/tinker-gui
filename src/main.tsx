import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import Root from "./Root.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <div className="antialiased font-mono bg-bg flex w-full h-screen items-center justify-center">
            <Root />
        </div>
    </React.StrictMode>
,
);
