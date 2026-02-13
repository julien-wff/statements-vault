<script lang="ts">
    import { page } from '$app/state';
    import { getTransactionsByRule } from '$lib/api/transactions.remote';
    import { getCategoryRuleById } from '$lib/api/metadata/category-rules.remote';
    import { getCategories } from '$lib/api/metadata/categories.remote';
    import { getAccounts } from '$lib/api/metadata/accounts.remote';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Calendar from '@lucide/svelte/icons/calendar';
    import Landmark from '@lucide/svelte/icons/landmark';
    import Regex from '@lucide/svelte/icons/regex';
    import Tag from '@lucide/svelte/icons/tag';
    import ArrowRight from '@lucide/svelte/icons/arrow-right';
    import Search from '@lucide/svelte/icons/search';
    import FileText from '@lucide/svelte/icons/file-text';
    import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';
    import { cleanTransactionDescription } from '$lib/utils/transactions';

    const ruleId = $derived(Number.parseInt(page.params.ruleId!));
    const rule = $derived(await getCategoryRuleById(ruleId));
    const rawTransactions = $derived(await getTransactionsByRule(ruleId));
    const categories = $derived(await getCategories());
    const accounts = $derived(await getAccounts());

    const transactions = $derived(
        rawTransactions
            .map(tr => ({
                ...tr,
                date: new Date(tr.startDate),
                account: accounts.find(acc => acc.id === tr.accountId),
            }))
            .toSorted((a, b) => b.date.getTime() - a.date.getTime()),
    );

    function getSubCategory(subCategoryId: string | null) {
        if (!subCategoryId) return null;
        for (const cat of categories) {
            const sub = cat.subCategories.find(s => s.id === subCategoryId);
            if (sub) return { ...sub, category: cat };
        }
        return null;
    }

    function formatAmount(amount: string | number | null, currency: string | null) {
        if (amount === null) return '–';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'EUR',
            minimumFractionDigits: 2,
        }).format(num);
    }

    const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        weekday: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const subCategory = $derived(rule ? getSubCategory(rule.subCategoryId) : null);
    const sourceAccount = $derived(rule?.transferSourceAccountId ? accounts.find(a => a.id === rule.transferSourceAccountId) : null);
    const destAccount = $derived(rule?.transferDestinationAccountId ? accounts.find(a => a.id === rule.transferDestinationAccountId) : null);
</script>

<svelte:head>
    <title>Rule Transactions | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/metadata/rules">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Rule Transactions</h1>
                <p class="text-sm text-slate-500 font-medium">View all transactions matching this rule</p>
            </div>
        </header>

        {#if !rule}
            <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <Regex class="mx-auto text-slate-300 mb-4" size={48}/>
                <p class="text-slate-500 font-medium">Rule not found</p>
                <a href="/metadata/rules"
                   class="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"> ← Back to rules </a>
            </section>
        {:else}
            <!-- Rule Details Card -->
            <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Regex class="text-purple-600" size={20}/>
                    <h3 class="text-lg font-bold">Rule Details</h3>
                </div>

                <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Pattern -->
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pattern</p>
                        <code class="text-sm font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-700 inline-block">
                            {rule.pattern}
                        </code>
                    </div>

                    <!-- Category -->
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                        {#if subCategory}
                            <div class="flex items-center gap-2">
                                <span class="size-8 rounded-lg flex items-center justify-center text-lg"
                                      style:background-color="color-mix(in oklab, #{subCategory.color} 10%, transparent 90%)">
                                    <i class={subCategory.icon} style:color="#{subCategory.color}"></i>
                                </span>
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-slate-800">{subCategory.name}</span>
                                    <span class="text-xs text-slate-400">{subCategory.category.name}</span>
                                </div>
                            </div>
                        {:else}
                            <span class="text-sm text-slate-400 italic">Uncategorized</span>
                        {/if}
                    </div>

                    <!-- Amount Type -->
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Type</p>
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium"
                              class:bg-emerald-100={rule.positiveAmount}
                              class:text-emerald-700={rule.positiveAmount}
                              class:bg-red-100={!rule.positiveAmount}
                              class:text-red-700={!rule.positiveAmount}
                        >
                            {rule.positiveAmount ? 'Credits (+)' : 'Debits (-)'}
                        </span>
                    </div>

                    <!-- Usage Stats -->
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stats</p>
                        <div class="text-sm font-semibold text-slate-600">
                            {rule.timeUsed}
                            {rule.timeUsed === 1 ? 'transaction' : 'transactions'}
                            <span class="text-slate-400 font-normal mx-1">•</span>
                            {formatAmount(rule.totalAmount, rule.currency)}
                        </div>
                    </div>
                </div>

                {#if sourceAccount || destAccount}
                    <div class="px-6 pb-6 pt-0">
                        <div class="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                            <Tag size={16} class="text-slate-400"/>
                            <span class="text-sm text-slate-600">Transfer:</span>
                            {#if sourceAccount}
                                <span class="text-sm font-medium text-slate-800">{sourceAccount.name}</span>
                            {:else}
                                <span class="text-sm text-slate-400">Any</span>
                            {/if}
                            <ArrowRight size={16} class="text-slate-400"/>
                            {#if destAccount}
                                <span class="text-sm font-medium text-slate-800">{destAccount.name}</span>
                            {:else}
                                <span class="text-sm text-slate-400">Any</span>
                            {/if}
                        </div>
                    </div>
                {/if}
            </section>

            <!-- Transactions Table -->
            <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex items-center gap-2">
                    <FileText class="text-blue-600" size={20}/>
                    <h3 class="text-lg font-bold">Transactions ({transactions.length})</h3>
                </div>

                {#if transactions.length === 0}
                    <div class="p-12 text-center">
                        <FileText class="mx-auto text-slate-300 mb-4" size={48}/>
                        <p class="text-slate-500 font-medium">No transactions match this rule</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="sticky top-0 z-10">
                            <tr class="bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Date
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Description
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-50">
                            {#each transactions as tr (tr.id)}
                                {@const cleanDesc = cleanTransactionDescription(tr.description)}
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-4 space-y-1">
                                        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                                             title={fullDateFormatter.format(tr.date)}>
                                            <Calendar size={12} class="text-slate-400"/>
                                            {tr.date.toLocaleDateString()}
                                        </div>
                                        <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                            <Landmark size={12}/>
                                            <span class="whitespace-nowrap">
                                                    {tr.account?.name ?? 'Unknown'}
                                                </span>
                                        </div>
                                    </td>

                                    <td class="px-6 py-4">
                                            <span class="text-sm text-slate-600 font-medium line-clamp-2 leading-snug"
                                                  title={tr.description}>
                                                {tr.description}
                                                <a href="https://google.com/search?q={encodeURIComponent(cleanDesc)}"
                                                   target="_blank" class="cursor-pointer" rel="noopener noreferrer">
                                                    <Search size={14} class="text-blue-600 inline -translate-y-0.5"/>
                                                </a>
                                            </span>
                                    </td>

                                    <td class="px-6 py-4 text-right">
                                            <span class="text-sm font-black whitespace-nowrap"
                                                  class:text-slate-700={tr.amount < 0}
                                                  class:text-emerald-600={tr.amount >= 0}>
                                                {tr.amount < 0 ? '' : '+'}{tr.amount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                                <span class="text-[10px] ml-0.5 opacity-70">{tr.currency}</span>
                                            </span>
                                    </td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </section>
        {/if}
    </div>
</main>
