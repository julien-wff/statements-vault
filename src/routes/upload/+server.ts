import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { banksEnum } from '$lib/server/db/schema';
import * as os from 'node:os';
import * as path from 'node:path';

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

    // TODO: parse transactions

    await Bun.file(filePath).delete();

    return json({ ok: true });
};
