"use client";

import { useEffect } from "react";

export function Shield() {
  useEffect(() => {
    // Disable right-click
    const onContext = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", onContext);

    // Disable text selection
    document.documentElement.style.userSelect = "none";
    (document.documentElement.style as Record<string, string>).webkitUserSelect = "none";

    // Block keyboard shortcuts
    const onKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && /^[usUp]$/i.test(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.shiftKey && /^[iIjJcC]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && /^[aA]$/.test(e.key)) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeydown);

    // Disable drag
    const onDrag = (e: Event) => e.preventDefault();
    document.addEventListener("dragstart", onDrag);

    // Disable copy
    const onCopy = (e: Event) => e.preventDefault();
    document.addEventListener("copy", onCopy);

    // Disable print
    const style = document.createElement("style");
    style.textContent = "@media print { body { display: none !important; } }";
    document.head.appendChild(style);

    // Anti-iframe
    if (window.top !== window.self) {
      document.body.innerHTML =
        '<h1 style="color:red;text-align:center;margin-top:40vh">Access Denied</h1>';
    }

    // Console warning
    console.log("%cSTOP!", "color:red;font-size:40px;font-weight:bold");
    console.log(
      "%cThis is protected content. Unauthorized copying or redistribution is prohibited.",
      "color:red;font-size:14px"
    );

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("copy", onCopy);
      style.remove();
    };
  }, []);

  return null;
}
