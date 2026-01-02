import { command, query } from '$app/server';
import { db } from '$lib/server/db';
import { categoryRule, transaction } from '$lib/server/db/schema';
import { and, count, desc, eq, gte, isNull, like, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

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

export const getTransactionToCategorize = query(async () => {
    const tr = await db
        .select({ name: transaction.description, amount: transaction.amount })
        .from(transaction)
        .where(isNull(transaction.subCategoryId))
        // @formatter:off
        .groupBy(sql`substr(${transaction.description}, 0, 20), CASE WHEN amount < 0 THEN -1 WHEN amount > 0 THEN 1 ELSE 0 END`)
        .orderBy(desc(count()))
        .limit(1);

    return db
        .select({
            id: transaction.id,
            description: transaction.description,
            date: transaction.date,
            amount: transaction.amount,
            accountId: transaction.accountId,
            currency: transaction.currency,
        })
        .from(transaction)
        .where(and(
            tr[0].amount > 0 ? gte(transaction.amount, 0) : lte(transaction.amount, 0),
            // @formatter:off
            eq(sql`substr(${transaction.description}, 0, 20)`, tr[0].name.slice(0, 19))
        ))
        .orderBy(sql`RANDOM()`)
        .limit(20);
});

const categorizationRuleSchema = z.object({
    pattern: z.string().min(1),
    subCategoryId: z.string().min(1),
    positiveAmount: z.boolean(),
})

export const applyCategorizationRule = command(categorizationRuleSchema, async (data) => {
    const rule = await db.insert(categoryRule).values(data).returning();

    await db
        .update(transaction)
        .set({
            subCategoryId: data.subCategoryId,
            withCategoryRule: rule[0].id,
        })
        .where(and(
            like(transaction.description, data.pattern),
            data.positiveAmount ? gte(transaction.amount, 0) : lte(transaction.amount, 0),
        ));

    await getTransactionToCategorize().refresh();
});
