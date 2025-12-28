import { command } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { account, banksEnum } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const saveAccount = command(
    z.object({
        id: z.number().optional(),
        name: z.string().min(1, 'Name is required'),
        bank: z.enum(banksEnum),
    }),
    async (data) => {
        await db
            .insert(account)
            .values(data)
            .onConflictDoUpdate({
                target: account.id,
                set: {
                    name: data.name,
                    bank: data.bank,
                },
            });
    },
);

export const deleteAccount = command(
    z.number(),
    async (id) => {
        await db.delete(account).where(eq(account.id, id));
    },
);
