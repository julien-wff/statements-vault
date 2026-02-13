import { command, query } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { account, banksEnum, category, CATEGORY_TYPE, categoryRule, subCategory } from '$lib/server/db/schema';

export const getAllMetadata = query(async () => {
    const accounts = await db.select().from(account).orderBy(account.id);
    const categories = await db.query.category.findMany({
        with: {
            subCategories: true,
        },
    });
    const rules = await db
        .select({
            id: categoryRule.id,
            pattern: categoryRule.pattern,
            subCategoryId: categoryRule.subCategoryId,
            positiveAmount: categoryRule.positiveAmount,
            transferSourceAccountId: categoryRule.transferSourceAccountId,
            transferDestinationAccountId: categoryRule.transferDestinationAccountId,
        })
        .from(categoryRule)
        .orderBy(categoryRule.id);

    return { accounts, categories, rules };
});

const backupSchema = z.object({
    accounts: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            bank: z.enum(banksEnum),
        }),
    ),
    categories: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum(CATEGORY_TYPE),
            color: z.string(),
            icon: z.string(),
            subCategories: z.array(
                z.object({
                    id: z.string(),
                    name: z.string(),
                    color: z.string(),
                    icon: z.string(),
                    categoryId: z.string(),
                }),
            ),
        }),
    ),
    rules: z.array(
        z.object({
            id: z.number(),
            pattern: z.string(),
            subCategoryId: z.string().nullable(),
            positiveAmount: z.boolean(),
            transferSourceAccountId: z.number().nullable(),
            transferDestinationAccountId: z.number().nullable(),
        }),
    ),
});

export const restoreAllMetadata = command(backupSchema, async data => {
    // Insert accounts first (rules and transactions reference them)
    for (const acc of data.accounts) {
        db.insert(account)
            .values(acc)
            .onConflictDoUpdate({
                target: account.id,
                set: { name: acc.name, bank: acc.bank },
            })
            .run();
    }

    // Insert categories
    for (const cat of data.categories) {
        db.insert(category)
            .values({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
            })
            .onConflictDoUpdate({
                target: category.id,
                set: {
                    name: cat.name,
                    type: cat.type,
                    color: cat.color,
                    icon: cat.icon,
                },
            })
            .run();

        // Insert subcategories
        for (const sub of cat.subCategories) {
            db.insert(subCategory)
                .values({
                    id: sub.id,
                    name: sub.name,
                    color: sub.color,
                    icon: sub.icon,
                    categoryId: cat.id,
                })
                .onConflictDoUpdate({
                    target: subCategory.id,
                    set: {
                        name: sub.name,
                        color: sub.color,
                        icon: sub.icon,
                        categoryId: cat.id,
                    },
                })
                .run();
        }
    }

    // Insert category rules
    for (const rule of data.rules) {
        db.insert(categoryRule)
            .values(rule)
            .onConflictDoUpdate({
                target: categoryRule.id,
                set: {
                    pattern: rule.pattern,
                    subCategoryId: rule.subCategoryId,
                    positiveAmount: rule.positiveAmount,
                    transferSourceAccountId: rule.transferSourceAccountId,
                    transferDestinationAccountId: rule.transferDestinationAccountId,
                },
            })
            .run();
    }

    await getAllMetadata().refresh();
});
