import { black, blue, magenta } from './colors';
import type { PDFPageProxy } from 'unpdf/pdfjs';

type TextItem = Awaited<ReturnType<PDFPageProxy['getTextContent']>>['items'][number];
type Viewport = ReturnType<PDFPageProxy['getViewport']>;

interface Position {
    x: number;
    y: number;
}

export interface TextNodeFeatures extends Position {
    text: string;
    width: number;
    height: number;
}

function extractTextNodeFeatures(node: TextItem, viewport: Viewport): TextNodeFeatures | null {
    if (!('str' in node) || !node.str.trim()) {
        return null;
    }

    const transform = node.transform;
    const x = Math.round(transform[4]);
    const y = Math.round(viewport.height - transform[5]);
    return {
        text: node.str,
        x,
        y,
        width: Math.round(node.width),
        height: Math.round(node.height),
    };
}

const SAME_LINE_TOLERANCE_PX = 3;

function sortByPosition(a: Position, b: Position) {
    if (Math.abs(a.y - b.y) <= SAME_LINE_TOLERANCE_PX) {
        return a.x - b.x;
    }
    return a.y - b.y;
}

export interface TableColumns {
    date: TextNodeFeatures;
    operations: TextNodeFeatures;
    debit: TextNodeFeatures;
    credit: TextNodeFeatures;
}

function getTableColumnNodes(nodes: TextNodeFeatures[]) {
    let columns = null as TableColumns | null;
    let tableStartIndex = 0;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const text = node.text.trim().toLowerCase();
        if (text !== 'date') {
            continue;
        }
        tableStartIndex = i + 4;

        const nodePlus1 = nodes[i + 1];
        const textPlus1 = nodePlus1?.text.trim().toLowerCase();
        if (!nodePlus1 || (textPlus1 !== 'opérations' && textPlus1 !== 'operations')) {
            continue;
        }

        const nodePlus2 = nodes[i + 2];
        const textPlus2 = nodePlus2?.text.trim().toLowerCase();
        if (!nodePlus2 || (!textPlus2?.includes('debit') && !textPlus2?.includes('débit'))) {
            continue;
        }

        const nodePlus3 = nodes[i + 3];
        const textPlus3 = nodePlus3?.text.trim().toLowerCase();
        if (!nodePlus3 || (!textPlus3?.includes('credit') && !textPlus3?.includes('crédit'))) {
            continue;
        }

        columns = {
            date: node,
            operations: nodePlus1,
            debit: nodePlus2,
            credit: nodePlus3,
        };
        break;
    }

    return { columns, tableStartIndex };
}

function extractStartDateFromNode(node: TextNodeFeatures): Date | null {
    const date = node.text.match(/au (\d{2}\/\d{2}\/\d{4})/)?.[1];
    if (date) {
        const [ day, month, year ] = date.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    return null;
}

export async function parsePage(page: PDFPageProxy) {
    const textNodes = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    let nodes = textNodes.items
        .map(n => extractTextNodeFeatures(n, viewport))
        .filter(n => n !== null)
        .toSorted(sortByPosition);

    console.log(`Found ${blue}${nodes.length} text nodes${black} on ${magenta}page ${page.pageNumber}${black} (${viewport.width}x${viewport.height})`);

    const { columns, tableStartIndex } = getTableColumnNodes(nodes);
    if (!columns) {
        throw new Error('Could not find table columns');
    }

    nodes = nodes.slice(tableStartIndex);
    let startDate: Date | null = null;
    let startBalance: number | null = null;
    if (nodes[0]?.text.toLowerCase().startsWith('ancien solde')) {
        startDate = extractStartDateFromNode(nodes[0]);
        startBalance = Number.parseFloat(nodes[1]!.text.replace(',', '.').replaceAll(' ', ''));
        nodes = nodes.slice(2);
    }

    let tableEndIndex = nodes.findIndex(n => n.x > 70 && n.text.toLowerCase().includes('total des opérations'));
    let endBalance = null;
    if (tableEndIndex !== -1) {
        let newBalanceIndex = nodes
            .slice(tableEndIndex, tableEndIndex + 6)
            .findIndex(n => n.text.toLocaleLowerCase().startsWith('nouveau solde'));
        endBalance = Number.parseFloat(nodes[tableEndIndex + newBalanceIndex + 1]!.text.replace(',', '.').replaceAll(' ', ''));
        nodes = nodes.slice(0, tableEndIndex);
    }

    console.log(
        `Found the ${blue}4 columns${black} on ${magenta}page ${page.pageNumber}${black}, parsing ${blue}${nodes.length} text nodes${black} as table rows` +
        (startDate ? `, starting from date ${blue}${startDate.toLocaleDateString()}${black}` : '') +
        (startBalance ? ` with ${blue}${startBalance.toFixed(2)} €${black}` : ''),
    );

    return { columns, nodes, startDate, startBalance, endBalance };
}
