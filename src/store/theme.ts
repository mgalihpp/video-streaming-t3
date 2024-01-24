import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  selectedTheme: string;
}

// Function to retrieve the theme from localStorage or use the default value
const getStoredTheme = (): string => {
  try {
    // Check if window is defined before accessing localStorage
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      return storedTheme ?? "light";
    }
  } catch (error) {
    // Handle potential SecurityError or other issues
    console.error("Error accessing localStorage:", error);
  }

  // Fallback to default value
  return "light";
};

// Set the initial state based on localStorage or the default value
const initialState: ThemeState = {
  selectedTheme: getStoredTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string | null | undefined>) => {
      state.selectedTheme = action.payload ?? "light";
      // Save the theme to localStorage
      localStorage.setItem("theme", state.selectedTheme);
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
