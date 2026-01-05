<script lang="ts">
    import Tag from '@lucide/svelte/icons/tag';
    import Check from '@lucide/svelte/icons/check';
    import Loader2 from '@lucide/svelte/icons/loader-2';
    import Lightbulb from '@lucide/svelte/icons/lightbulb';
    import SubcategorySearch from './SubcategorySearch.svelte';
    import type { account } from '$lib/server/db/schema';

    interface SubCategory {
        id: string;
        name: string;
        color: string;
        categoryName: string;
        categoryType: string;
    }

    interface Props {
        subcategories: SubCategory[];
        selectedSubCategoryId: string;
        pattern: string;
        isSubmitting: boolean;
        suggestedType?: string;
        matchCount: number;
        selectedCount: number;
        createRule: boolean;
        accounts: typeof account.$inferSelect[];
        transferSourceAccountId?: number | null;
        transferDestinationAccountId?: number | null;
        onsubmit: (e: Event) => void;
    }

    let {
        subcategories,
        selectedSubCategoryId = $bindable(),
        pattern = $bindable(),
        isSubmitting,
        suggestedType,
        matchCount,
        selectedCount,
        createRule = $bindable(true),
        accounts,
        transferSourceAccountId = $bindable(),
        transferDestinationAccountId = $bindable(),
        onsubmit,
    }: Props = $props();

    const isTransfer = $derived(
        subcategories.find(sub => sub.id === selectedSubCategoryId)?.categoryType === 'Transfer',
    );
    const invalidTransfer = $derived(isTransfer && (
        transferSourceAccountId === null ||
        transferDestinationAccountId === null ||
        transferSourceAccountId === transferDestinationAccountId
    ));
</script>

<div class="space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div class="bg-purple-50 text-purple-600 p-1.5 rounded-lg">
                <Tag size={18}/>
            </div>
            <h2 class="font-bold text-slate-800">Classification</h2>
        </div>

        <form class="space-y-4" onsubmit={onsubmit}>
            <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input bind:checked={createRule}
                       class="w-4 h-4 rounded border-slate-300 accent-blue-600 focus:ring-blue-500"
                       id="createRule"
                       type="checkbox"/>
                <label class="text-sm font-bold text-slate-700 cursor-pointer select-none"
                       for="createRule">
                    Create a categorization rule
                </label>
            </div>

            <SubcategorySearch
                    bind:selectedSubCategoryId
                    {subcategories}
                    {suggestedType}
            />

            {#if createRule}
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest"
                           for="pattern">
                        Match Pattern (SQLite LIKE)
                    </label>

                    <input
                            bind:value={pattern}
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            id="pattern"
                            placeholder="Description pattern..."
                            type="text"/>

                    <p class="text-[10px] text-slate-400 font-medium italic">
                        Use % as a wildcard to match any characters.
                    </p>
                </div>
            {/if}

            {#if isTransfer}
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest"
                           for="account">
                        Source account
                    </label>

                    <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            bind:value={transferSourceAccountId}
                            id="account">
                        <option value={null} disabled selected>
                            Select source account
                        </option>
                        {#each accounts as account}
                            <option value={account.id}>{account.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest"
                           for="account">
                        Destination account
                    </label>

                    <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            bind:value={transferDestinationAccountId}
                            id="account">
                        <option value={null} disabled selected>
                            Select destination account
                        </option>
                        {#each accounts as account}
                            <option value={account.id}>{account.name}</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <button class="cursor-pointer disabled:cursor-not-allowed w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-4"
                    disabled={!selectedSubCategoryId || isSubmitting || invalidTransfer || (createRule ? (matchCount === 0 || !pattern) : selectedCount === 0)}
                    type="submit">
                {#if isSubmitting}
                    <Loader2 class="animate-spin" size={20}/>
                    Applying...
                {:else}
                    <Check size={20}/>
                    Categorize {createRule ? matchCount : selectedCount} transactions
                {/if}
            </button>
        </form>
    </div>
</div>
