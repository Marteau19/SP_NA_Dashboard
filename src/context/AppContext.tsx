import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Currency } from "../data/seedData";
import { LATEST_PERIOD_INDEX, type Filters, type GroupFilter } from "../lib/derive";

interface AppState {
  group: GroupFilter;
  setGroup: (g: GroupFilter) => void;
  periodIndex: number;
  setPeriodIndex: (i: number) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  presentation: boolean;
  setPresentation: (v: boolean) => void;
  filters: Filters;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [group, setGroup] = useState<GroupFilter>("ALL");
  const [periodIndex, setPeriodIndex] = useState(LATEST_PERIOD_INDEX);
  const [currency, setCurrency] = useState<Currency>("CAD");
  const [presentation, setPresentation] = useState(false);

  const filters = useMemo<Filters>(
    () => ({ group, periodIndex, currency }),
    [group, periodIndex, currency]
  );

  const value: AppState = {
    group,
    setGroup,
    periodIndex,
    setPeriodIndex,
    currency,
    setCurrency,
    presentation,
    setPresentation,
    filters,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
