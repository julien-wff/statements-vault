import { parseFile } from 'fast-csv';
import type { JsonTransactionReport, Transaction } from '../index';

interface RevolutCsvLine {
    Type: string;
    Product: string;
    'Started Date': string;
    'Completed Date': string;
    Description: string;
    Amount: string;
    Fee: string;
    Currency: string;
    State: string;
    Balance: string;
}

const readCsv = (file: string) =>
    new Promise<RevolutCsvLine[]>((resolve, reject) => {
        const rows = [] as RevolutCsvLine[];

        parseFile(file, { headers: true, trim: true })
            .on('error', error => reject(error))
            .on('data', row => {
                rows.push(row);
            })
            .on('end', (rowCount: number) => {
                console.log(`Parsed ${rowCount} rows`);
                resolve(rows);
            });
    });

function transformCsv(lines: RevolutCsvLine[], fileId: number, accountId: number): JsonTransactionReport {
    const transactions: Transaction[] = lines.map(line => {
        const date = new Date(line['Completed Date']);
        const amount = Number.parseFloat(line['Amount'].replace(',', '.'));
        const currency = line['Currency'];
        return {
            date: date.toISOString(),
            description: line['Description'],
            amount,
            currency,
            accountId,
            fileId,
        } satisfies Transaction;
    });

    const startDate = new Date(transactions.at(0)!.date);
    const startBalance =
        lines.length > 0
            ? Number.parseFloat(lines.at(0)!['Balance'].replace(',', '.')) -
            Number.parseFloat(lines.at(0)!['Amount'].replace(',', '.'))
            : 0;
    const endBalance = lines.length > 0 ? Number.parseFloat(lines.at(-1)!['Balance'].replace(',', '.')) : 0;

    return {
        startBalance,
        endBalance,
        startDate,
        transactions,
    };
}

export async function parseRevolutCsv(filePath: string, fileId: number, accountId: number) {
    console.log(`Parsing Revolut CSV file at ${filePath}`);
    const rawLines = await readCsv(filePath);
    return transformCsv(rawLines, fileId, accountId);
}
