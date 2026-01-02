export const cleanTransactionDescription = (description: string) => description
    .toLowerCase()
    .replaceAll(/\d{2}[/.-]\d{2}[./-](\d{2,4})?/g, ' ')
    .replaceAll(/carte (numero|no) \d+/g, ' ')
    .replaceAll(/(eur|dkk|usd) \d+[,.]\d{2}/g, ' ')
    .replaceAll('achat cb', ' ')
    .replaceAll(/ref(erence)? :? ?[^ ]+/g, ' ')
    .replaceAll(/\d{8,}/g, ' ')
    .replaceAll('instantane', '')
    .replace(/(samsung|google|apple) pay$/, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
