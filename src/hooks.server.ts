import type { ServerInit } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

export const init: ServerInit = async () => {
    migrate(db, { migrationsFolder: './drizzle' });
    db.$client.run('PRAGMA foreign_keys = ON;');
};
