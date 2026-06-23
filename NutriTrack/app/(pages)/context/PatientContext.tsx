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

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly active (1–3 days/week)",
  moderate: "Moderately active (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very active (physical job / 2x/day training)",
};

// Standard PAL (Physical Activity Level) multipliers for TDEE estimation
export const ACTIVITY_LEVEL_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface Patient {
  id: string;
  userId: number;
  name: string;
  birthdate: string;
  age: number;
  height: number;
  gender: Gender;
  ethnicity: Ethnicity;
  activityLevel: ActivityLevel;
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

/**
 * Mifflin-St Jeor BMR formula, then scaled by activity level to get TDEE.
 * weightKg should come from the patient's most recent weight entry.
 */
export function calculateTDEE(
  patient: Pick<Patient, "age" | "height" | "gender" | "activityLevel">,
  weightKg: number,
): number {
  const age = patient.age;
  const height = patient.height;
  const gender = patient.gender;
  const activityLevel = patient.activityLevel;

  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    bmr = 10 * weightKg + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * height - 5 * age - 78;
  }

  return Math.round(bmr * ACTIVITY_LEVEL_MULTIPLIER[activityLevel]);
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

export function PatientProvider(props: { children: React.ReactNode }) {
  const children = props.children;
  const auth = useAuthContext();
  const currentUser = auth.currentUser;

  const allPatientsState = useState<StoredPatient[]>([]);
  const allPatients = allPatientsState[0];
  const setAllPatients = allPatientsState[1];

  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  const lastViewedState = useState<string | null>(null);
  const lastViewedPatientId = lastViewedState[0];
  const setLastViewedPatientIdState = lastViewedState[1];

  useEffect(() => {
    Promise.all([
      loadFromStorage(),
      AsyncStorage.getItem(LAST_VIEWED_KEY),
    ]).then((results) => {
      const stored = results[0];
      const lastId = results[1];
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

  const myPatients = useMemo(() => {
    if (!currentUser) return [];
    return allPatients.filter((p) => p.userId === currentUser.id);
  }, [allPatients, currentUser]);

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
      const next = allPatients.map((p) => {
        if (p.id === id && p.userId === currentUser?.id) {
          return { ...p, ...updates };
        }
        return p;
      });
      await persist(next);
    },
    [allPatients, currentUser],
  );

  const deletePatient = useCallback(
    async (id: string) => {
      const next = allPatients.filter((p) => {
        return !(p.id === id && p.userId === currentUser?.id);
      });
      await persist(next);
    },
    [allPatients, currentUser],
  );

  const getPatientById = useCallback(
    (id: string) => {
      const found = allPatients.find((p) => {
        return p.id === id && p.userId === currentUser?.id;
      });
      return found ? withAge(found) : undefined;
    },
    [allPatients, currentUser],
  );

  const contextValue: PatientContextType = {
    patients: myPatients.map(withAge),
    loading: loading,
    lastViewedPatientId: lastViewedPatientId,
    setLastViewedPatientId: setLastViewedPatientId,
    addPatient: addPatient,
    updatePatient: updatePatient,
    deletePatient: deletePatient,
    getPatientById: getPatientById,
  };

  return (
    <PatientContext.Provider value={contextValue}>
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
