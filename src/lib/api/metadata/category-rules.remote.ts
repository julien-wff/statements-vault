import { command, query } from '$app/server';
import { db } from '$lib/server/db';
import { categoryRule, transaction } from '$lib/server/db/schema';
import { count, desc, eq, sum } from 'drizzle-orm';
import { z } from 'zod';
import { applyRulesOnAllTransactions } from '$lib/server/rules/apply-rules';

export const getCategoryRuleById = query(z.int().positive(), async (ruleId) => {
    const rules = await db
        .select({
            id: categoryRule.id,
            pattern: categoryRule.pattern,
            subCategoryId: categoryRule.subCategoryId,
            positiveAmount: categoryRule.positiveAmount,
            transferSourceAccountId: categoryRule.transferSourceAccountId,
            transferDestinationAccountId: categoryRule.transferDestinationAccountId,
            timeUsed: count(transaction.id),
            totalAmount: sum(transaction.amount),
            currency: transaction.currency,
        })
        .from(categoryRule)
        .leftJoin(transaction, eq(categoryRule.id, transaction.withCategoryRule))
        .where(eq(categoryRule.id, ruleId))
        .groupBy(categoryRule.id);

    return rules[0] ?? null;
});

export const getCategoryRules = query(async () => {
    return db
        .select({
            id: categoryRule.id,
            pattern: categoryRule.pattern,
            subCategoryId: categoryRule.subCategoryId,
            timeUsed: count(transaction.id),
            totalAmount: sum(transaction.amount),
            currency: transaction.currency,
        })
        .from(categoryRule)
        .leftJoin(transaction, eq(categoryRule.id, transaction.withCategoryRule))
        .groupBy(categoryRule.id)
        .orderBy((rules) => desc(rules.timeUsed));
});

const ruleDeleteSchema = z.int().positive();

export const deleteCategoryRule = command(ruleDeleteSchema, async (ruleId) => {
    await db
        .update(transaction)
        .set({
            subCategoryId: null,
            withCategoryRule: null,
            transferSourceAccountId: null,
            transferDestinationAccountId: null,
        })
        .where(eq(transaction.withCategoryRule, ruleId));

    await db.delete(categoryRule).where(eq(categoryRule.id, ruleId));

    await getCategoryRules().refresh();
});

export const applyAllRulesToAllTransactions = command(async () => {
    return applyRulesOnAllTransactions().then(r => r.length);
});
