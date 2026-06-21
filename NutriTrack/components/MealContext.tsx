import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: string;
  patientId: string;
  foodName: string;
  calories: number; // total kcal for the logged portion
  portionSize: number; // grams
  mealType: MealType;
  dateTime: string; // ISO 8601
  createdAt: string; // ISO 8601
}

type MealInput = Omit<Meal, "id" | "createdAt">;

interface MealContextType {
  meals: Meal[];
  loading: boolean;
  addMeal: (meal: MealInput) => Promise<void>;
  updateMeal: (id: string, updates: Partial<MealInput>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getMealsByPatientId: (patientId: string) => Meal[];
  getMealById: (id: string) => Meal | undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "meal_records";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function loadFromStorage(): Promise<Meal[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Meal[]) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(meals: Meal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch {
    console.warn("Failed to persist meals to AsyncStorage.");
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const MealContext = createContext<MealContextType | null>(null);

export function MealProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load persisted meals on mount
  useEffect(() => {
    loadFromStorage().then((stored) => {
      setMeals(stored);
      setLoading(false);
    });
  }, []);

  const persist = async (updated: Meal[]) => {
    setMeals(updated);
    await saveToStorage(updated);
  };

  const addMeal = useCallback(
    async (meal: MealInput) => {
      const newMeal: Meal = {
        ...meal,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      await persist([...meals, newMeal]);
    },
    [meals],
  );

  const updateMeal = useCallback(
    async (id: string, updates: Partial<MealInput>) => {
      await persist(meals.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [meals],
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      await persist(meals.filter((m) => m.id !== id));
    },
    [meals],
  );

  const getMealsByPatientId = useCallback(
    (patientId: string) =>
      meals
        .filter((m) => m.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
        ),
    [meals],
  );

  const getMealById = useCallback(
    (id: string) => meals.find((m) => m.id === id),
    [meals],
  );

  return (
    <MealContext.Provider
      value={{
        meals,
        loading,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByPatientId,
        getMealById,
      }}
    >
      {children}
    </MealContext.Provider>
  );
}

// ── Hook ──

export function useMealContext(): MealContextType {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMealContext must be used within a MealProvider");
  }
  return context;
}
