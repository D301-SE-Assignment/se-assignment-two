import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"
import * as sqlitecore from "drizzle-orm/sqlite-core"

export const users = sqliteTable('users',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        email: text('email').notNull().unique(),
        password: text('password').notNull()
    }
)

export const profiles = sqliteTable('profiles',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        user_id: integer('user_id').notNull().references(() => users.id),
        name: text('name').notNull(),
        birthdate: text('birthdate').notNull(),
        gender: text('gender'),
        ethnicity: text('ethnicity'),
        dietary_requirements: text('dietary_requirements'),
        medical_conditions: text('medical_conditions'),
    }
)
export const sessions = sqliteTable('sessions',
    {
        token: text('token').primaryKey(),
        user_id: integer('user_id').notNull().references(() => users.id),
        profile_id: integer('profile_id').references(() => profiles.id),
        expiry: integer('expiry').notNull(),
    }
)

export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type Session = typeof sessions.$inferSelect