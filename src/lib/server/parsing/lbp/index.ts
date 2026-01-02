import { getDocumentProxy } from 'unpdf';
import { extractTable } from './extract-table';
import { black, blue, green, magenta } from './colors';
import { parsePage } from './parse-page';
import { round } from './utils';
import type { JsonTransactionReport, Transaction } from '../index';

export async function parsePDF(filePath: string, fileId: number, accountId: number): Promise<JsonTransactionReport> {
    console.log(`${magenta}Parsing ${filePath}${black}`);

    const file = await Bun.file(filePath).arrayBuffer();
    const doc = await getDocumentProxy(file);

    let transactions: Transaction[] = [];
    let startDate: Date | null = null;
    let startBalance: number | null = null;
    let endBalance: number | null = null;

    for (let pageIndex = 0; pageIndex < doc.numPages; pageIndex++) {
        const page = await doc.getPage(pageIndex + 1);

        const {
            columns,
            nodes,
            startDate: currentStartDate,
            startBalance: currentStartBalance,
            endBalance: currentEndBalance,
        } = await parsePage(page);
        if (currentStartDate !== null) {
            startDate = currentStartDate;
        }
        if (currentStartBalance !== null) {
            startBalance = currentStartBalance;
        }
        if (currentEndBalance !== null) {
            endBalance = currentEndBalance;
        }

        if (startDate === null) {
            throw new Error('No start date found');
        }

        const pageTransactions = extractTable(columns, nodes, startDate);
        transactions = [ ...transactions, ...pageTransactions ];
        console.log(
            `Extracted ${blue}${pageTransactions.length} transactions${black} from ${magenta}page ${
                page.pageNumber
            }${black}, totalling ${blue}${pageTransactions
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)} €${black}`,
        );

        if (currentEndBalance !== null) {
            console.log(`Reached the end of the first table, exiting loop`);
            break;
        }
    }

    console.log(`${green}Finished extracting a total of ${transactions.length} transactions${black}`);

    for (let i = 0; i < transactions.length; i++) {
        transactions[i].fileId = fileId;
        transactions[i].accountId = accountId;
        transactions[i].predictedBalance = round(
            ((i === 0 ? startBalance : transactions[i - 1].predictedBalance) ?? 0) + transactions[i].amount,
            2,
        );
    }

    const endBalanceCalculated = transactions.at(-1)?.predictedBalance ?? null;
    if (endBalance === null || endBalanceCalculated === null || round(endBalanceCalculated, 2) !== round(endBalance, 2)) {
        throw new Error(
            `Balances discrepancies: expected ${endBalance} €, calculated ${endBalanceCalculated?.toFixed(2)} €`,
        );
    }

    console.log(
        `${green}Start balance: ${startBalance!.toFixed(2)} €, End balance: ${endBalance.toFixed(2)} €${black}`,
    );

    return {
        startBalance: startBalance!,
        endBalance: endBalance,
        startDate: startDate!,
        transactions,
    };
}
