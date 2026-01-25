<script lang="ts">
    import { deleteCategoryRule, getCategoryRules } from '$lib/api/metadata/category-rules.remote';
    import { getCategories } from '$lib/api/metadata/categories.remote';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Regex from '@lucide/svelte/icons/regex';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import List from '@lucide/svelte/icons/list';
    import Loader2 from '@lucide/svelte/icons/loader-2';
    import Tag from '@lucide/svelte/icons/tag';
    import GitFork from '@lucide/svelte/icons/git-fork';
    import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';

    const rules = $derived(await getCategoryRules());
    const categories = $derived(await getCategories());

    let deletingRuleId = $state<number | null>(null);

    function getSubCategory(subCategoryId: string | null) {
        if (!subCategoryId) return null;
        for (const cat of categories) {
            const sub = cat.subCategories.find(s => s.id === subCategoryId);
            if (sub) return { ...sub, category: cat };
        }
        return null;
    }

    function formatAmount(amount: string | null, currency: string | null) {
        if (!amount) return '–';
        const num = parseFloat(amount);
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'EUR',
            minimumFractionDigits: 2,
        }).format(num);
    }

    async function handleDelete(ruleId: number) {
        if (!confirm('Are you sure you want to delete this rule? All transactions categorized with this rule will be uncategorized.')) {
            return;
        }
        deletingRuleId = ruleId;
        try {
            await deleteCategoryRule(ruleId);
        } finally {
            deletingRuleId = null;
        }
    }
</script>

<svelte:head>
    <title>Category Rules | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Category Rules</h1>
                <p class="text-sm text-slate-500 font-medium">Manage automatic categorization rules</p>
            </div>
        </header>

        <div>
            <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex items-center gap-1">
                    <GitFork class="text-red-600" size={20}/>
                    <h3 class="text-lg font-bold">All Rules ({rules.length})</h3>
                </div>

                {#if rules.length === 0}
                    <div class="p-12 text-center">
                        <Regex class="mx-auto text-slate-300 mb-4" size={48}/>
                        <p class="text-slate-500 font-medium">No category rules yet</p>
                        <p class="text-sm text-slate-400 mt-1">Rules are created when you categorize transactions
                            with patterns</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                            <tr class="bg-slate-50 border-b border-slate-100">
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Pattern
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Category
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Usage
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Total
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                            {#each rules as rule (rule.id)}
                                {@const subCategory = getSubCategory(rule.subCategoryId)}
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4">
                                        <code class="text-sm font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                                            {rule.pattern}
                                        </code>
                                    </td>
                                    <td class="px-6 py-4">
                                        {#if subCategory}
                                            <div class="flex items-center gap-2">
                                                        <span class="size-8 rounded-lg flex items-center justify-center text-lg"
                                                              style:background-color="color-mix(in oklab, #{subCategory.color} 10%, transparent 90%)">
                                                            <i class="{subCategory.icon}"
                                                               style:color="#{subCategory.color}"></i>
                                                        </span>
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-medium text-slate-800">{subCategory.name}</span>
                                                    <span class="text-xs text-slate-400">{subCategory.name}</span>
                                                </div>
                                            </div>
                                        {:else}
                                            <span class="text-sm text-slate-400 italic">Uncategorized</span>
                                        {/if}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                                <span class="text-sm font-semibold text-slate-600 whitespace-nowrap">
                                                    {rule.timeUsed}
                                                    {rule.timeUsed === 1 ? 'time' : 'times'}
                                                </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                                <span class="text-sm font-semibold text-slate-600">
                                                    {formatAmount(rule.totalAmount, rule.currency)}
                                                </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="/metadata/rules/{rule.id}"
                                               class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                               title="View transactions">
                                                <List size={18}/>
                                            </a>
                                            <button
                                                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={deletingRuleId === rule.id}
                                                    onclick={() => handleDelete(rule.id)}
                                                    class:cursor-pointer={deletingRuleId !== rule.id}
                                                    class:cursor-loading={deletingRuleId === rule.id}
                                                    title="Delete rule"
                                            >
                                                {#if deletingRuleId === rule.id}
                                                    <Loader2 class="animate-spin" size={18}/>
                                                {:else}
                                                    <Trash2 size={18}/>
                                                {/if}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </section>
        </div>
    </div>
</main>
