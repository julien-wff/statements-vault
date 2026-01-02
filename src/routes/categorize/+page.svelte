<script lang="ts">
    import {
        applyCategorizationRule,
        getTransactionToCategorize,
        testCategoryRule,
    } from '$lib/api/transactions.remote';
    import { getAccounts } from '$lib/api/metadata/accounts.remote';
    import { getCategories } from '$lib/api/metadata/categories.remote';
    import CategorizeHeader from '$lib/components/categorize/CategorizeHeader.svelte';
    import CategorizeSuccess from '$lib/components/categorize/CategorizeSuccess.svelte';
    import CategorizeForm from '$lib/components/categorize/CategorizeForm.svelte';
    import TransactionTable from '$lib/components/categorize/TransactionTable.svelte';
    import { cleanTransactionDescription } from '$lib/utils/transactions';

    const accounts = $derived(await getAccounts());
    const categories = $derived(await getCategories());

    const transactionsPromise = $derived(getTransactionToCategorize());
    const transactions = $derived(
        (await transactionsPromise)
            ?.map(tr => ({
                ...tr,
                date: new Date(tr.date),
                account: accounts.find(acc => acc.id === tr.accountId)!,
            }))
            .toSorted((a, b) => b.date.getTime() - a.date.getTime()) ?? [],
    );

    let selectedSubCategoryId = $state('');
    let pattern = $derived('%' + cleanTransactionDescription(transactions[0].description) + '%');
    let isSubmitting = $state(false);

    let transferSourceAccountId = $state<number | null>(null);
    let transferDestinationAccountId = $state<number | null>(null);

    const matchingIdsFromPattern = $derived(await testCategoryRule({
        pattern,
        positiveAmount: transactions.length > 0 ? transactions[0].amount >= 0 : true,
    }));

    const allSubCategories = $derived(
        categories.flatMap(cat =>
            cat.subCategories.map(sub => ({
                ...sub,
                categoryName: cat.name,
                categoryType: cat.type,
            })),
        ),
    );

    const avgAmount = $derived(
        transactions.reduce((acc, tr) => acc + tr.amount, 0) / (transactions.length || 1),
    );

    const suggestedType = $derived(avgAmount < 0 ? 'Expense' : 'Income');

    async function handleApply(e: Event) {
        e.preventDefault();
        if (!selectedSubCategoryId || !pattern) return;

        isSubmitting = true;
        try {
            await applyCategorizationRule({
                pattern,
                subCategoryId: selectedSubCategoryId,
                positiveAmount: transactions[0].amount >= 0,
                transferSourceAccountId: transferSourceAccountId,
                transferDestinationAccountId: transferDestinationAccountId,
            });
            selectedSubCategoryId = '';
            transferSourceAccountId = null;
            transferDestinationAccountId = null;
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Categorize | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <CategorizeHeader onrefresh={() => getTransactionToCategorize().refresh()}/>

        {#if (await transactionsPromise).length === 0}
            <CategorizeSuccess/>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div class="lg:col-span-5">
                    <CategorizeForm
                            bind:pattern
                            bind:selectedSubCategoryId
                            matchCount={matchingIdsFromPattern.length}
                            {accounts}
                            {isSubmitting}
                            onsubmit={handleApply}
                            subcategories={allSubCategories}
                            bind:transferSourceAccountId
                            bind:transferDestinationAccountId
                            {suggestedType}/>
                </div>

                <div class="lg:col-span-7">
                    <TransactionTable
                            {transactions}
                            {matchingIdsFromPattern}
                            onsetpattern={p => (pattern = p)}/>
                </div>
            </div>
        {/if}
    </div>
</main>
