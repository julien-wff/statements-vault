import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
    const accounts = await db.query.account.findMany();
    return {
        accounts,
    };
};
