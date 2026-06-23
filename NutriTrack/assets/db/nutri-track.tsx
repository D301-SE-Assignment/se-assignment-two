import { Platform } from "react-native";

export const migration = `
  ${Platform.OS !== "web" ? "PRAGMA journal_mode = WAL;" : ""}
  CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS "profiles" (
    "id" INTEGER PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL,
    "gender" TEXT,
    "ethnicity" TEXT,
    "dietary_requirements" TEXT,
    "medical_conditions" TEXT,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
  );
`;
