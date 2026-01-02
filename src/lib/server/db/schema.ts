import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const banksEnum = [ 'revolut', 'lbp' ] as const;
export const CATEGORY_TYPE = [ 'Income', 'Expense', 'Transfer' ] as const;

export const account = sqliteTable('account', {
    id: integer().primaryKey({ autoIncrement: true }),
    bank: text({ enum: banksEnum }).notNull(),
    name: text().notNull(),
});

export const accountRelations = relations(account, ({ many }) => ({
    transactions: many(transaction),
}));

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

export const subCategoryRelations = relations(subCategory, ({ one, many }) => ({
    category: one(category, {
        fields: [ subCategory.categoryId ],
        references: [ category.id ],
    }),
    transactions: many(transaction),
}));

export const file = sqliteTable('file', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
});

export const fileRelations = relations(file, ({ many }) => ({
    transactions: many(transaction),
}));

export const transaction = sqliteTable('transaction', {
    id: integer().primaryKey({ autoIncrement: true }),
    accountId: integer().notNull().references(() => account.id),
    fileId: integer().notNull().references(() => file.id),
    date: text().notNull(),
    amount: numeric({ mode: 'number' }).notNull(),
    currency: text().notNull(),
    description: text().notNull(),
    subCategoryId: text().references(() => subCategory.id),
    predictedBalance: numeric({ mode: 'number' }),
});

export const transactionRelations = relations(transaction, ({ one }) => ({
    account: one(account, {
        fields: [ transaction.accountId ],
        references: [ account.id ],
    }),
    file: one(file, {
        fields: [ transaction.fileId ],
        references: [ file.id ],
    }),
    subCategory: one(subCategory, {
        fields: [ transaction.subCategoryId ],
        references: [ subCategory.id ],
    }),
}));
