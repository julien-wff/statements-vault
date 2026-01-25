import { db } from '$lib/server/db';
import { and, gte, isNull, like, lte } from 'drizzle-orm';
import { categoryRule, transaction } from '$lib/server/db/schema';

const applyRuleOnTransactions = async (rule: typeof categoryRule.$inferSelect) => db
    .update(transaction)
    .set({
        subCategoryId: rule.subCategoryId,
        withCategoryRule: rule.id,
        transferSourceAccountId: rule.transferSourceAccountId,
        transferDestinationAccountId: rule.transferDestinationAccountId,
    })
    .where(and(
        like(transaction.description, rule.pattern),
        rule.positiveAmount ? gte(transaction.amount, 0) : lte(transaction.amount, 0),
        isNull(transaction.withCategoryRule),
    ))
    .returning({ id: transaction.id });

export async function applyRulesOnAllTransactions() {
    const rules = await db.query.categoryRule.findMany();

    const transactionUpdates: number[] = [];
    for (const rule of rules) {
        const updates = await applyRuleOnTransactions(rule);
        transactionUpdates.push(...updates.map((u) => u.id));
    }

    return transactionUpdates;
}
