import { query } from '$app/server';
import { db } from '$lib/server/db';
import { account, file, transaction } from '$lib/server/db/schema';
import { count, desc, eq, max } from 'drizzle-orm';

export const getFilesCount = query(async () => {
    const res = await db.select({ count: count() }).from(file);
    return res[0].count;
});

export const getLatestFiles = query(async () => {
    return db
        .select({
            transactions: count(),
            name: file.name,
            date: max(transaction.date),
            accountName: account.name,
            accountBank: account.bank,
        })
        .from(file)
        .leftJoin(transaction, eq(transaction.fileId, file.id))
        .leftJoin(account, eq(transaction.accountId, account.id))
        .orderBy(desc(transaction.date))
        .limit(5)
        .groupBy(file.id);
});

export const getAllFiles = query(async () => {
    return db
        .select({
            transactions: count(),
            name: file.name,
            date: max(transaction.date),
            accountName: account.name,
            accountBank: account.bank,
        })
        .from(file)
        .leftJoin(transaction, eq(transaction.fileId, file.id))
        .leftJoin(account, eq(transaction.accountId, account.id))
        .orderBy(desc(transaction.date))
        .groupBy(file.id);
});
