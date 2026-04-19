"use client";

import { useEffect } from "react";

/**
 * Drop this into any server-rendered page that needs natural document scroll.
 * The root globals.css sets `html, body { overflow: hidden }` for the app shell,
 * so pages outside the shell (profil, success, etc.) need this override.
 */
export function ScrollUnlock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    return () => {
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, []);
  return null;
}
