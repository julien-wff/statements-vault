import { parsePDF as parseLBP } from '$lib/server/parsing/lbp';
import type { transaction } from '$lib/server/db/schema';
import { parseRevolutCsv } from '$lib/server/parsing/revolut';
import { parsePaypalCsv } from '$lib/server/parsing/paypal';

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
    paypal: parsePaypalCsv,
} as const;
