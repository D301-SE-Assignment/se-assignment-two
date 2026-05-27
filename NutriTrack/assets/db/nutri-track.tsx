export const migration =
`
    /*
    PRAGMA foreign_keys = OFF;

    DROP TABLE IF EXISTS "sessions";
    DROP TABLE IF EXISTS "profiles";
    DROP TABLE IF EXISTS "users";

    PRAGMA foreign_keys = ON;
    */

    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS "sessions" (
        "token" TEXT PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "profile_id" INTEGER,
        "expiry" INTEGER,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
        FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id")
    );
`