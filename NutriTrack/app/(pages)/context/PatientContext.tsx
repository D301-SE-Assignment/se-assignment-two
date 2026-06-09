import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";

export type Ethnicity =
  | "NZ Maori"
  | "NZ European"
  | "Pacific Peoples"
  | "Asian"
  | "Other";

export interface Patient {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  gender: Gender;
  ethnicity: Ethnicity;
  createdAt: string; // ISO 8601
}

type PatientInput = Omit<Patient, "id" | "createdAt">;

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  addPatient: (patient: PatientInput) => Promise<void>;
  updatePatient: (id: string, updates: Partial<PatientInput>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "patient_records";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function loadFromStorage(): Promise<Patient[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Patient[]) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(patients: Patient[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch {
    console.warn("Failed to persist patients to AsyncStorage.");
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load persisted patients on mount
  useEffect(() => {
    loadFromStorage().then((stored) => {
      setPatients(stored);
      setLoading(false);
    });
  }, []);

  const persist = async (updated: Patient[]) => {
    setPatients(updated);
    await saveToStorage(updated);
  };

  const addPatient = useCallback(
    async (patient: PatientInput) => {
      const newPatient: Patient = {
        ...patient,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      await persist([...patients, newPatient]);
    },
    [patients],
  );

  const updatePatient = useCallback(
    async (id: string, updates: Partial<PatientInput>) => {
      await persist(
        patients.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [patients],
  );

  const deletePatient = useCallback(
    async (id: string) => {
      await persist(patients.filter((p) => p.id !== id));
    },
    [patients],
  );

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients],
  );

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
        getPatientById,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

// ── Hook ──

export function usePatientContext(): PatientContextType {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext must be used within a PatientProvider");
  }
  return context;
}
