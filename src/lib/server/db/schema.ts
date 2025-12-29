import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const banksEnum = [ 'revolut', 'lbp' ] as const;
export const CATEGORY_TYPE = [ 'Income', 'Expense', 'Transfer' ] as const;

export const account = sqliteTable('account', {
    id: integer().primaryKey({ autoIncrement: true }),
    bank: text({ enum: banksEnum }).notNull(),
    name: text().notNull(),
});

export const category = sqliteTable('category', {
    id: text().primaryKey(),
    name: text().notNull(),
    type: text({ enum: CATEGORY_TYPE }).notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
    subCategories: many(subCategory),
}));

export const subCategory = sqliteTable('sub_category', {
    id: text().primaryKey(),
    name: text().notNull(),
    categoryId: text().notNull().references(() => category.id),
});

export const subCategoryRelations = relations(subCategory, ({ one }) => ({
    category: one(category, {
        fields: [ subCategory.categoryId ],
        references: [ category.id ],
    }),
}));

