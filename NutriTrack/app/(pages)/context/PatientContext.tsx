import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthContext } from "./AuthContext";

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
  userId: number;
  name: string;
  birthdate: string;
  age: number;
  height: number;
  gender: Gender;
  ethnicity: Ethnicity;
  dietaryRequirements?: string;
  medicalConditions?: string;
  createdAt: string;
}

type PatientInput = Omit<Patient, "id" | "createdAt" | "age" | "userId">;

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  lastViewedPatientId: string | null;
  setLastViewedPatientId: (id: string) => Promise<void>;
  addPatient: (patient: PatientInput) => Promise<void>;
  updatePatient: (id: string, updates: Partial<PatientInput>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "patient_records";
const LAST_VIEWED_KEY = "last_viewed_patient_id";

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
  const { currentUser } = useAuthContext();

  const [allPatients, setAllPatients] = useState<StoredPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastViewedPatientId, setLastViewedPatientIdState] = useState<
    string | null
  >(null);

  useEffect(() => {
    Promise.all([
      loadFromStorage(),
      AsyncStorage.getItem(LAST_VIEWED_KEY),
    ]).then(([stored, lastId]) => {
      setAllPatients(stored);
      if (lastId) setLastViewedPatientIdState(lastId);
      setLoading(false);
    });
  }, []);

  const setLastViewedPatientId = useCallback(async (id: string) => {
    setLastViewedPatientIdState(id);
    await AsyncStorage.setItem(LAST_VIEWED_KEY, id);
  }, []);

  const persist = async (updated: StoredPatient[]) => {
    setAllPatients(updated);
    await saveToStorage(updated);
  };

  const myPatients = useMemo(
    () =>
      currentUser ? allPatients.filter((p) => p.userId === currentUser.id) : [],
    [allPatients, currentUser],
  );

  const addPatient = useCallback(
    async (patient: PatientInput) => {
      if (!currentUser) {
        throw new Error("Cannot add a patient without a logged-in user.");
      }
      const newPatient: StoredPatient = {
        ...patient,
        id: generateId(),
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      await persist([...allPatients, newPatient]);
    },
    [allPatients, currentUser],
  );

  const updatePatient = useCallback(
    async (id: string, updates: Partial<PatientInput>) => {
      await persist(
        allPatients.map((p) =>
          p.id === id && p.userId === currentUser?.id
            ? { ...p, ...updates }
            : p,
        ),
      );
    },
    [allPatients, currentUser],
  );

  const deletePatient = useCallback(
    async (id: string) => {
      await persist(
        allPatients.filter(
          (p) => !(p.id === id && p.userId === currentUser?.id),
        ),
      );
    },
    [allPatients, currentUser],
  );

  const getPatientById = useCallback(
    (id: string) => {
      const found = allPatients.find(
        (p) => p.id === id && p.userId === currentUser?.id,
      );
      return found ? withAge(found) : undefined;
    },
    [allPatients, currentUser],
  );

  return (
    <PatientContext.Provider
      value={{
        patients: myPatients.map(withAge),
        loading,
        lastViewedPatientId,
        setLastViewedPatientId,
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
