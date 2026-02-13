import { query } from '$app/server';
import { db } from '$lib/server/db';
import { account, file, transaction } from '$lib/server/db/schema';
import { count, desc, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { error } from '@sveltejs/kit';

export const getFilesCount = query(async () => {
    const res = await db.select({ count: count() }).from(file);
    return res[0].count;
});

export const getLatestFiles = query(async () => {
    return db
        .select({
            id: file.id,
            transactions: count(),
            name: file.name,
            date: max(transaction.startDate),
            accountName: account.name,
            accountBank: account.bank,
        })
        .from(file)
        .leftJoin(transaction, eq(transaction.fileId, file.id))
        .leftJoin(account, eq(transaction.accountId, account.id))
        .orderBy(file => desc(file.date))
        .limit(6)
        .groupBy(file.id);
});

export const getAllFiles = query(async () => {
    return db
        .select({
            id: file.id,
            transactions: count(),
            name: file.name,
            date: max(transaction.startDate),
            accountName: account.name,
            accountBank: account.bank,
        })
        .from(file)
        .leftJoin(transaction, eq(transaction.fileId, file.id))
        .leftJoin(account, eq(transaction.accountId, account.id))
        .orderBy(desc(transaction.startDate))
        .groupBy(file.id);
});

export const getFileDetailsById = query(z.int().positive(), async id => {
    const fileData = await db.query.file.findFirst({
        where: eq(file.id, id),
    });

    if (!fileData) {
        error(404, 'File not found');
    }

    const transactions = await db.query.transaction.findMany({
        where: eq(transaction.fileId, id),
        with: {
            account: true,
            subCategory: {
                with: {
                    category: true,
                },
            },
        },
        orderBy: desc(transaction.startDate),
    });

    return {
        ...fileData,
        transactions,
    };
});
