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
  birthdate: string; // ISO date, e.g. "1990-05-12"
  age: number; // computed from birthdate at read time
  height: number; // cm
  gender: Gender;
  ethnicity: Ethnicity;
  dietaryRequirements?: string;
  medicalConditions?: string;
  createdAt: string; // ISO 8601
}

type PatientInput = Omit<Patient, "id" | "createdAt" | "age">;

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

function calculateAge(birthdate: string): number {
  const dob = new Date(birthdate);
  if (isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

type StoredPatient = Omit<Patient, "age">;

function withAge(p: StoredPatient): Patient {
  return { ...p, age: calculateAge(p.birthdate) };
}

async function loadFromStorage(): Promise<StoredPatient[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPatient[]) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(patients: StoredPatient[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch {
    console.warn("Failed to persist patients to AsyncStorage.");
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<StoredPatient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load persisted patients on mount
  useEffect(() => {
    loadFromStorage().then((stored) => {
      setPatients(stored);
      setLoading(false);
    });
  }, []);

  const persist = async (updated: StoredPatient[]) => {
    setPatients(updated);
    await saveToStorage(updated);
  };

  const addPatient = useCallback(
    async (patient: PatientInput) => {
      const newPatient: StoredPatient = {
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
    (id: string) => {
      const found = patients.find((p) => p.id === id);
      return found ? withAge(found) : undefined;
    },
    [patients],
  );

  return (
    <PatientContext.Provider
      value={{
        patients: patients.map(withAge),
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
