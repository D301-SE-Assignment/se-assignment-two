import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core"

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

export const record_types = sqliteTable('record_types',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        type_name: text('type_name').notNull(),
        units: text('units').notNull()
    }
)

export const profile_records = sqliteTable('profile_records',
    {
        profile_id: integer('profile_id').references(() => profiles.id),
        record_type: integer('record_type').references(() => record_types.id),
        measured_at: integer('measured_at').notNull(),
        value: real('value').notNull()
    }, (table) =>
    [
        primaryKey({ columns: [table.profile_id, table.record_type] })
    ]
)

export const meals = sqliteTable('meals',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name').notNull(),
        description: text('description'),
        calories: integer('calories').notNull(),
        nutrition_information: text('nutrition_information')
    }
)

export const meal_records = sqliteTable('meal_records',
    {
        profile_id: integer('profile_id').references(() => profiles.id),
        meal_id: integer('meal_id').references(() => meals.id),
        eaten_at: text('eaten_at').notNull(),
        quantity: real('quantity').notNull(),
    }, (table) =>
    [
        primaryKey({ columns: [table.profile_id, table.meal_id] })
    ]
)

export const favourite_meals = sqliteTable('favourite_meals',
    {
        user_id: integer('user_id').references(() => users.id),
        meal_id: integer('meal_id').references(() => meals.id),
    }, (table) =>
    [
        primaryKey({ columns: [table.user_id, table.meal_id] })
    ]
)

export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type Session = typeof sessions.$inferSelect