import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { banksEnum, file as fileTable, transaction as transactionTable } from '$lib/server/db/schema';
import * as os from 'node:os';
import * as path from 'node:path';
import { parsers } from '$lib/server/parsing';
import { db } from '$lib/server/db';

const schema = z.object({
    file: z.file(),
    bank: z.enum(banksEnum),
    account: z.number().min(1),
});

export const POST: RequestHandler = async ({ request }) => {
    const formData = await request.formData();
    const parsed = schema.safeParse({
        file: formData.get('file'),
        bank: formData.get('bank'),
        account: Number(formData.get('account')),
    });

    if (!parsed.success) {
        return json({ ok: false, errors: JSON.parse(parsed.error.message) }, { status: 400 });
    }
    const { file, bank, account } = parsed.data;

    const filePath = path.join(os.tmpdir(), file.name);
    await Bun.write(filePath, file);

    try {
        const dbFile = await db
            .insert(fileTable)
            .values({
                name: file.name,
            })
            .returning();

        const { transactions } = await parsers[bank](filePath, dbFile[0].id, account);
        await db.insert(transactionTable).values(transactions);
    } catch (e) {
        console.error(e);
        return json({ ok: false, error: (e as Error).message }, { status: 500 });
    } finally {
        await Bun.file(filePath).delete();
    }

    return json({ ok: true });
};
