<script lang="ts">
    import { getCategories, updateCategories } from '$lib/api/metadata/categories.remote';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Tag from '@lucide/svelte/icons/tag';
    import Loader2 from '@lucide/svelte/icons/loader-2';

    let error = $state<null | string>(null);
    let loading = $state(false);
    let categoriesInput = $state('');
    const isInputValid = $derived(categoriesInput.trim().at(0) === '{' && categoriesInput.trim().at(-1) === '}');

    const categories = $derived(await getCategories());
    const categoriesStats = $derived.by(() => {
        const stats = {
            Income: { count: 0, subCount: 0 },
            Expense: { count: 0, subCount: 0 },
            Transfer: { count: 0, subCount: 0 },
        };
        for (const cat of categories) {
            const type = cat.type as keyof typeof stats;
            if (stats[type]) {
                stats[type].count++;
                stats[type].subCount += cat.subCategories.length;
            }
        }
        return stats;
    });

    async function handleCategoriesSubmit(ev: Event) {
        ev.preventDefault();
        try {
            error = null;
            loading = true;
            await updateCategories(JSON.parse(categoriesInput));
            categoriesInput = '';
        } catch (e) {
            console.error(e);
            error = (e as any).body?.message || (e as Error).message || 'An unknown error occurred';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Manage Categories</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Manage Categories</h1>
                <p class="text-sm text-slate-500 font-medium">Define your income and expense categories</p>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-4 space-y-6">
                <section class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <Tag class="text-purple-600" size={20}/>
                        Stats
                    </h3>
                    <div class="grid grid-cols-1 gap-3">
                        {#each Object.entries(categoriesStats) as [ type, { count, subCount } ]}
                            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">{type}</div>
                                    <div class="text-2xl font-bold text-slate-800">{count}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs text-slate-400 font-medium">{subCount} subcategories</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </section>
            </div>

            <div class="lg:col-span-8">
                <section class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-lg font-bold mb-4">Configuration</h3>

                    {#if error}
                        <div class="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    {/if}

                    <form class="space-y-6" onsubmit={handleCategoriesSubmit}>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2" for="categories">
                                JSON Configuration (EBK format)
                            </label>
                            <textarea
                                    autocomplete="off"
                                    bind:value={categoriesInput}
                                    class="block w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[200px]"
                                    id="categories"
                                    placeholder={'{ "categories": [...] }'}
                                    rows="10"></textarea>
                        </div>

                        <button class="w-full cursor-pointer bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2 shadow-sm shadow-purple-100"
                                disabled={!isInputValid || loading}
                                type="submit">
                            {#if loading}
                                <Loader2 class="animate-spin" size={20}/>
                            {/if}
                            Update Categories
                        </button>
                    </form>
                </section>
            </div>
        </div>
    </div>
</main>
