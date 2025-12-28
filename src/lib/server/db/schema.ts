import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const banksEnum = [ 'revolut', 'lbp' ] as const;

export const account = sqliteTable('account', {
    id: integer().primaryKey({ autoIncrement: true }),
    bank: text({ enum: banksEnum }).notNull(),
    name: text().notNull(),
});
