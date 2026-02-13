import { parseFile } from 'fast-csv';
import type { Transaction } from '$lib/server/parsing';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

interface PaypalCsvLine {
    'Date': string;
    'Heure': string;
    'Fuseau horaire': string;
    'Description': string;
    'Devise': string;
    'Brut': string;
    'Frais': string;
    'Net': string;
    'Solde': string;
    'Numéro de transaction': string;
    'Adresse email de l\'expéditeur': string;
    'Nom': string;
    'Nom de la banque': string;
    'Compte bancaire': string;
    'Montant des frais de livraison et de traitement': string;
    'TVA': string;
    'Numéro de facture': string;
    'Numéro de la transaction de référence': string;
}

const readCsv = (file: string) =>
    new Promise<PaypalCsvLine[]>((resolve, reject) => {
        const rows = [] as PaypalCsvLine[];

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

export async function parsePaypalCsv(filePath: string, fileId: number, accountId: number) {
    const csvLines = await readCsv(filePath);

    const transactions = csvLines.map(line => {
        const date = dayjs
            .tz(`${line['Date']} ${line['Heure']}`, 'DD/MM/YYYY HH:mm:ss', line['Fuseau horaire'])
            .toISOString();
        const amount = Number.parseFloat(line['Net'].replace(',', '.'));
        const predictedBalance = Number.parseFloat(line['Solde'].replace(',', '.'));

        return {
            startDate: date,
            endDate: date,
            description: line['Description'] + (line['Nom'] ? ` - ${line['Nom']}` : ''),
            amount,
            currency: line['Devise'],
            predictedBalance,
            accountId,
            fileId,
        } satisfies Transaction;
    });

    const startDate = new Date(transactions.at(0)!.startDate);
    const startBalance = transactions.at(0)!.predictedBalance - transactions.at(0)!.amount;
    const endBalance = transactions.at(-1)!.predictedBalance;

    return {
        transactions,
        startBalance,
        endBalance,
        startDate,
    };
}
