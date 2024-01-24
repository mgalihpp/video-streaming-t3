"use client";

import { RootState } from "@/store/store";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProviders: React.FC<ThemeProviderProps> = ({ children }) => {
  const selectedTheme = useSelector(
    (state: RootState) => state.theme.selectedTheme,
  );

  useEffect(() => {
    document.body.className = selectedTheme === "dark" ? "dark" : "light";
  }, [selectedTheme]);

  return <>{children}</>;
};

export default ThemeProviders;
