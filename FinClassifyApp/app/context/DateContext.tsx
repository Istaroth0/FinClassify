// contexts/DateContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

interface DateContextType {
  selectedYear: number;
  selectedMonth: string; // e.g., "Jan", "Feb"
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: string) => void;
  selectedDateString: string; // e.g., "2024 Jan"
}

// Helper to get current date parts
const getCurrentDateParts = () => {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[monthIndex];
  return { year, month };
};

const { year: initialYear, month: initialMonth } = getCurrentDateParts();

// Create the context with a default value (can be undefined or initial state)
const DateContext = createContext<DateContextType | undefined>(undefined);

// Create a provider component
interface DateProviderProps {
  children: ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    const selectedDateString = `${selectedYear} ${selectedMonth}`;
    return {
      selectedYear,
      selectedMonth,
      setSelectedYear,
      setSelectedMonth,
      selectedDateString,
    };
  }, [selectedYear, selectedMonth]);

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};

// Create a custom hook to use the context easily
export const useDateContext = (): DateContextType => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider");
  }
  return context;
};
