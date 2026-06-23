import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

// patientId -> daily calorie goal (kcal)
type GoalMap = Record<string, number>;

interface GoalContextType {
  goals: GoalMap;
  loading: boolean;
  getGoalByPatientId: (patientId: string) => number;
  setGoal: (patientId: string, calories: number) => Promise<void>;
  clearGoal: (patientId: string) => Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "calorie_goals";
export const DEFAULT_CALORIE_GOAL = 2000;

async function loadFromStorage(): Promise<GoalMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoalMap) : {};
  } catch {
    return {};
  }
}

async function saveToStorage(goals: GoalMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    console.warn("Failed to persist calorie goals to AsyncStorage.");
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const GoalContext = createContext<GoalContextType | null>(null);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<GoalMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().then((stored) => {
      setGoals(stored);
      setLoading(false);
    });
  }, []);

  const persist = async (updated: GoalMap) => {
    setGoals(updated);
    await saveToStorage(updated);
  };

  const getGoalByPatientId = useCallback(
    (patientId: string) => goals[patientId] ?? DEFAULT_CALORIE_GOAL,
    [goals],
  );

  const setGoal = useCallback(
    async (patientId: string, calories: number) => {
      await persist({ ...goals, [patientId]: calories });
    },
    [goals],
  );

  const clearGoal = useCallback(
    async (patientId: string) => {
      const { [patientId]: _removed, ...rest } = goals;
      await persist(rest);
    },
    [goals],
  );

  return (
    <GoalContext.Provider
      value={{ goals, loading, getGoalByPatientId, setGoal, clearGoal }}
    >
      {children}
    </GoalContext.Provider>
  );
}

// ── Hook ──

export function useGoalContext(): GoalContextType {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error("useGoalContext must be used within a GoalProvider");
  }
  return context;
}
