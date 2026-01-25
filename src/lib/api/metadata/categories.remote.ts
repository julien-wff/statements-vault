import { command, query } from '$app/server';
import { getCategoryIcon } from '$lib/utils/category-icons';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { category, subCategory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    hidden: z.boolean(),
    color: z.string(),
    icon: z.string(),
    subCategories: z.array(z.object({
        id: z.string(),
        name: z.string(),
        hidden: z.boolean(),
        color: z.string(),
        icon: z.string(),
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
    const newCategoryIds = new Set<string>();
    const newSubCategoryIds = new Set<string>();

    for (const typeKey of [ '1', '2', '3' ] as const) {
        const typeMap = { '1': 'Income', '2': 'Expense', '3': 'Transfer' } as const;
        const categories = data[typeKey];

        for (const cat of categories) {
            if (cat.hidden) {
                continue;
            }

            newCategoryIds.add(cat.id);

            db.insert(category).values({
                id: cat.id,
                name: cat.name,
                type: typeMap[typeKey],
                color: cat.color,
                icon: getCategoryIcon(cat.icon),
            }).onConflictDoUpdate({
                target: category.id,
                set: {
                    name: cat.name,
                    type: typeMap[typeKey],
                    color: cat.color,
                    icon: getCategoryIcon(cat.icon),
                },
            }).run();

            for (const subCat of cat.subCategories) {
                if (subCat.hidden) {
                    continue;
                }

                newSubCategoryIds.add(subCat.id);

                db.insert(subCategory).values({
                    id: subCat.id,
                    name: subCat.name,
                    categoryId: cat.id,
                    color: subCat.color,
                    icon: getCategoryIcon(subCat.icon),
                }).onConflictDoUpdate({
                    target: subCategory.id,
                    set: {
                        name: subCat.name,
                        categoryId: cat.id,
                        color: subCat.color,
                        icon: getCategoryIcon(subCat.icon),
                    },
                }).run();
            }
        }
    }

    // Delete subcategories that are no longer in the remote data
    const existingSubCategories = db.query.subCategory.findMany().sync();
    for (const subCat of existingSubCategories) {
        if (!newSubCategoryIds.has(subCat.id)) {
            db.delete(subCategory).where(eq(subCategory.id, subCat.id)).run();
        }
    }

    // Attempt to delete categories that are no longer in the remote data
    const existingCategories = db.query.category.findMany().sync();
    const undeletedCategories: string[] = [];
    for (const cat of existingCategories) {
        if (!newCategoryIds.has(cat.id)) {
            try {
                db.delete(category).where(eq(category.id, cat.id)).run();
            } catch {
                undeletedCategories.push(cat.name);
            }
        }
    }

    await getCategories().refresh();

    if (undeletedCategories.length > 0) {
        error(400, `Cannot delete the following categories because they are in use: ${undeletedCategories.join(', ')}`);
    }
});
