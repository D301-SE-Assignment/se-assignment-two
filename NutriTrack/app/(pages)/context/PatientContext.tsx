import React, { createContext, useContext, useState } from "react";

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
  height: number;
  gender: Gender;
  ethnicity: Ethnicity;
  createdAt: Date;
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, "id" | "createdAt">) => void;
}

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);

  const addPatient = (patient: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPatients((prev) => [...prev, newPatient]);
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext must be used within a PatientProvider");
  }
  return context;
}
