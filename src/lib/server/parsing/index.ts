import { parsePDF as parseLBP } from '$lib/server/parsing/lbp';
import type { transaction } from '$lib/server/db/schema';
import { parseRevolutCsv } from '$lib/server/parsing/revolut';

export interface JsonTransactionReport {
    transactions: Transaction[];
    startBalance: number;
    endBalance: number;
    startDate: Date;
}

export type Transaction = typeof transaction.$inferInsert;

export const parsers = {
    lbp: parseLBP,
    revolut: parseRevolutCsv,
} as const;
