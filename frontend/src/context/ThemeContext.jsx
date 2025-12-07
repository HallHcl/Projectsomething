import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [language, setLanguage] = useState("th");

  // Load language from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.language) setLanguage(parsed.language);
      } catch (e) {
        console.error("parse user", e);
      }
    }
  }, []);

  const setLanguageLocally = (lang) => {
    setLanguage(lang);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.language = lang;
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <ThemeContext.Provider value={{ language, setLanguage: setLanguageLocally }}>
      {children}
    </ThemeContext.Provider>
  );
}
