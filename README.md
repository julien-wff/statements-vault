<p align="center">
  <h1 align="center">Statements Vault</h1>
  <p align="center">
    A tool to parse and classify bank statements for use in budgeting apps like
    <a href="https://ezbookkeeping.mayswind.net/">ezBookKeeping</a> or
    <a href="https://simonwep.github.io/ocular/">Ocular</a>.
  </p>
</p>

![demo](https://github.com/user-attachments/assets/6ebfd28d-a9b2-43d6-bb15-19074f2ec9de)

Most self-hosted budgeting software don't implement bank imports, especially from PDF statements.
**Statements Vault** serves as an intermediate layer to ingest these files, handle the classification with a better UX
than typical budgeting apps, and prepare the data for export.

### What it does

- **Parsing**: Supports Revolut (French CSV), PayPal (CSV), and La Banque Postale (PDF).
- **Categorization**: A dedicated interface to quickly tag transactions.
- **Rule Engine**: Create rules based on transaction descriptions to automate classification for future imports.
- **Export**: Generate CSV files formatted for ezBookKeeping or Ocular.

### Philosophy

This is a pragmatic tool built for personal use. It doesn't track net worth or manage budgets; it just makes getting
data from your bank into your budgeting app faster and more accurate.

### Setup

1. **Install**: `bun install --frozen-lockfile`
3. **Run**: `bun --bun run dev`
