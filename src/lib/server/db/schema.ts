import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const banksEnum = [ 'revolut', 'lbp', 'paypal' ] as const;
export const CATEGORY_TYPE = [ 'Income', 'Expense', 'Transfer' ] as const;

export const account = sqliteTable('account', {
    id: integer().primaryKey({ autoIncrement: true }),
    bank: text({ enum: banksEnum }).notNull(),
    name: text().notNull(),
});

export const accountRelations = relations(account, ({ many }) => ({
    transactions: many(transaction),
    transferSourceTransactions: many(transaction),
    transferDestinationTransactions: many(transaction),
    transferSourceCategoryRules: many(categoryRule),
    transferDestinationCategoryRules: many(categoryRule),
}));

export const category = sqliteTable('category', {
    id: text().primaryKey(),
    name: text().notNull(),
    type: text({ enum: CATEGORY_TYPE }).notNull(),
    color: text().notNull(),
    icon: text().notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
    subCategories: many(subCategory),
}));

export const subCategory = sqliteTable('sub_category', {
    id: text().primaryKey(),
    name: text().notNull(),
    color: text().notNull(),
    icon: text().notNull(),
    categoryId: text().notNull().references(() => category.id),
});

export const subCategoryRelations = relations(subCategory, ({ one, many }) => ({
    category: one(category, {
        fields: [ subCategory.categoryId ],
        references: [ category.id ],
    }),
    transactions: many(transaction),
    categoryRules: many(categoryRule),
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
    startDate: text().notNull(),
    endDate: text().notNull(),
    amount: numeric({ mode: 'number' }).notNull(),
    currency: text().notNull(),
    description: text().notNull(),
    subCategoryId: text().references(() => subCategory.id),
    predictedBalance: numeric({ mode: 'number' }),
    withCategoryRule: integer().references(() => categoryRule.id),
    transferSourceAccountId: integer().references(() => account.id),
    transferDestinationAccountId: integer().references(() => account.id),
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
    categoryRule: one(categoryRule, {
        fields: [ transaction.withCategoryRule ],
        references: [ categoryRule.id ],
    }),
    transferSourceAccount: one(account, {
        fields: [ transaction.transferSourceAccountId ],
        references: [ account.id ],
    }),
    transferDestinationAccount: one(account, {
        fields: [ transaction.transferDestinationAccountId ],
        references: [ account.id ],
    }),
}));

export const categoryRule = sqliteTable('category_rule', {
    id: integer().primaryKey({ autoIncrement: true }),
    pattern: text().notNull(),
    /** If the subcategory is null, matching transactions must be tagged manually **/
    subCategoryId: text().references(() => subCategory.id),
    /** true: only credits, false: only debits **/
    positiveAmount: integer({ mode: 'boolean' }).notNull(),
    transferSourceAccountId: integer().references(() => account.id),
    transferDestinationAccountId: integer().references(() => account.id),
});

export const categoryRuleRelations = relations(categoryRule, ({ one, many }) => ({
    subCategory: one(subCategory, {
        fields: [ categoryRule.subCategoryId ],
        references: [ subCategory.id ],
    }),
    transactions: many(transaction),
    transferSourceAccount: one(account, {
        fields: [ categoryRule.transferSourceAccountId ],
        references: [ account.id ],
    }),
    transferDestinationAccount: one(account, {
        fields: [ categoryRule.transferDestinationAccountId ],
        references: [ account.id ],
    }),
}));
