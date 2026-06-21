import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type WeightUnit = "kg" | "lbs";

export interface WeightEntry {
  id: string;
  patientId: string;
  weight: number;
  unit: WeightUnit;
  dateTime: string; // ISO 8601
  createdAt: string; // ISO 8601
}

type WeightInput = Omit<WeightEntry, "id" | "createdAt">;

interface WeightContextType {
  weightEntries: WeightEntry[];
  loading: boolean;
  addWeightEntry: (entry: WeightInput) => Promise<void>;
  updateWeightEntry: (
    id: string,
    updates: Partial<WeightInput>,
  ) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  getWeightEntriesByPatientId: (patientId: string) => WeightEntry[];
  getWeightEntryById: (id: string) => WeightEntry | undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "weight_records";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function loadFromStorage(): Promise<WeightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(entries: WeightEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    console.warn("Failed to persist weight entries to AsyncStorage.");
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const WeightContext = createContext<WeightContextType | null>(null);

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().then((stored) => {
      setWeightEntries(stored);
      setLoading(false);
    });
  }, []);

  const persist = async (updated: WeightEntry[]) => {
    setWeightEntries(updated);
    await saveToStorage(updated);
  };

  const addWeightEntry = useCallback(
    async (entry: WeightInput) => {
      const newEntry: WeightEntry = {
        ...entry,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      await persist([...weightEntries, newEntry]);
    },
    [weightEntries],
  );

  const updateWeightEntry = useCallback(
    async (id: string, updates: Partial<WeightInput>) => {
      await persist(
        weightEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
    },
    [weightEntries],
  );

  const deleteWeightEntry = useCallback(
    async (id: string) => {
      await persist(weightEntries.filter((e) => e.id !== id));
    },
    [weightEntries],
  );

  const getWeightEntriesByPatientId = useCallback(
    (patientId: string) =>
      weightEntries
        .filter((e) => e.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
        ),
    [weightEntries],
  );

  const getWeightEntryById = useCallback(
    (id: string) => weightEntries.find((e) => e.id === id),
    [weightEntries],
  );

  return (
    <WeightContext.Provider
      value={{
        weightEntries,
        loading,
        addWeightEntry,
        updateWeightEntry,
        deleteWeightEntry,
        getWeightEntriesByPatientId,
        getWeightEntryById,
      }}
    >
      {children}
    </WeightContext.Provider>
  );
}

// ── Hook ──

export function useWeightContext(): WeightContextType {
  const context = useContext(WeightContext);
  if (!context) {
    throw new Error("useWeightContext must be used within a WeightProvider");
  }
  return context;
}