import { command, query } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { category, subCategory } from '$lib/server/db/schema';

const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    hidden: z.boolean(),
    color: z.string(),
    subCategories: z.array(z.object({
        id: z.string(),
        name: z.string(),
        hidden: z.boolean(),
        color: z.string(),
    })),
});

const categoriesSchema = z.object({
    result: z.object({
        '1': z.array(categorySchema),
        '2': z.array(categorySchema),
        '3': z.array(categorySchema),
    }),
    success: z.boolean(),
});

export const getCategories = query(async () => {
    return db.query.category.findMany({
        with: {
            subCategories: true,
        },
    });
});

export const updateCategories = command(categoriesSchema, async ({ result: data }) => {
    db.delete(category).run();
    db.delete(subCategory).run();

    for (const typeKey of [ '1', '2', '3' ] as const) {
        const typeMap = { '1': 'Income', '2': 'Expense', '3': 'Transfer' } as const;
        const categories = data[typeKey];

        for (const cat of categories) {
            db.insert(category).values({
                id: cat.id,
                name: cat.name,
                type: typeMap[typeKey],
                color: cat.color,
            }).run();

            for (const subCat of cat.subCategories) {
                db.insert(subCategory).values({
                    id: subCat.id,
                    name: subCat.name,
                    categoryId: cat.id,
                    color: subCat.color,
                }).run();
            }
        }
    }

    await getCategories().refresh();
});
