export const BANKS = {
    lbp: {
        name: 'La Banque Postale',
        acceptedFormats: [ 'application/pdf' ],
    },
    revolut: {
        name: 'Revolut',
        acceptedFormats: [ 'text/csv' ],
    },
    paypal: {
        name: 'PayPal',
        acceptedFormats: [ 'text/csv' ],
    },
} as const;
