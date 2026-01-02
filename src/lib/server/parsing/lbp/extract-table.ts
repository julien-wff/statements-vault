import type { Transaction } from '../index';
import type { TableColumns, TextNodeFeatures } from './parse-page';

const inRange = (value: number, range: readonly [ number, number ]) => value >= range[0] && value <= range[1];

/**
 * Parse the date from dd/mm format using the startDate to determine the year.
 * Note: if the startDate is in December and the month is January, the year should be incremented.
 * @param startDate The starting date to determine the year.
 * @param dateToParse The date string in dd/mm format.
 * @returns The parsed Date object.
 */
function parseDate(startDate: Date, dateToParse: string): Date {
    const [ dayStr, monthStr ] = dateToParse.trim().split('/');
    let day = Number.parseInt(dayStr, 10);
    let month = Number.parseInt(monthStr, 10);
    let year = startDate.getFullYear();

    // If the parsed month is less than the startDate month, we have crossed into a new year
    if (month < (startDate.getMonth() + 1)) {
        year += 1;
    }

    return new Date(year, month - 1, day);
}

export function extractTable(columns: TableColumns, nodes: TextNodeFeatures[], startDate: Date) {
    const dateX = [ columns.date.x - 2, columns.date.x + 2 ] as const;
    const operationsX = [ columns.operations.x - 2, columns.operations.x + 2 ] as const;
    const debitX = [ columns.debit.x - 20, columns.debit.x + columns.debit.width ] as const;
    const creditX = [ columns.credit.x - 20, columns.credit.x + columns.credit.width ] as const;

    let transactions: Transaction[] = [];

    for (const node of nodes) {
        if (node.y > 785) {
            continue;
        }

        if (inRange(node.x, dateX)) {
            transactions.push({
                date: parseDate(startDate, node.text).toISOString(),
                description: '',
                amount: 0,
                currency: 'EUR',
                accountId: 0,
                fileId: 0,
            });
            continue;
        }

        if (inRange(node.x, operationsX)) {
            const lastTransaction = transactions.at(-1)!;
            if (lastTransaction.description === '') {
                lastTransaction.description = node.text.trim();
            } else {
                lastTransaction.description += ' ' + node.text.trim();
            }
            continue;
        }

        if (inRange(node.x, debitX)) {
            const lastTransaction = transactions.at(-1)!;
            const amountText = node.text.replaceAll(/\s+/g, '').replace(',', '.').replace(' ', '');
            const amount = Number.parseFloat(amountText);
            lastTransaction.amount = (Number.isNaN(amount) ? 0 : amount) * -1;
            continue;
        }

        if (inRange(node.x, creditX)) {
            const lastTransaction = transactions.at(-1)!;
            const amountText = node.text.replaceAll(/\s+/g, '').replace(',', '.').replace(' ', '');
            const amount = Number.parseFloat(amountText);
            lastTransaction.amount = Number.isNaN(amount) ? 0 : amount;
            continue;
        }
    }

    return transactions;
}
