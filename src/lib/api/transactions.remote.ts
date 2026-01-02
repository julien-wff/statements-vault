import { query } from '$app/server';
import { db } from '$lib/server/db';
import { transaction } from '$lib/server/db/schema';
import { count, isNull } from 'drizzle-orm';

export const getTransactionsCount = query(async () => {
    const res = await db.select({ count: count() }).from(transaction);
    return res[0].count;
});

export const getUncategorizedTransactionsCount = query(async () => {
    const res = await db
        .select({ count: count() })
        .from(transaction)
        .where(isNull(transaction.subCategoryId));
    return res[0].count;
});
