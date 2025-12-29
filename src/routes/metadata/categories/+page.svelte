<script lang="ts">
    import { getCategories, updateCategories } from '$lib/api/metadata/categories.remote';

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

<main class="h-screen grid place-content-center bg-slate-100">
    <section class="p-6 bg-white rounded shadow-md w-96">
        <h1 class="text-2xl font-bold mb-4">Categories</h1>

        <div class="grid grid-cols-3 gap-2 mb-6">
            {#each Object.entries(categoriesStats) as [ type, { count, subCount } ]}
                <div class="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{type}</div>
                    <div class="text-2xl font-bold text-slate-800">{count}</div>
                    <div class="text-xs text-slate-400">{subCount} sub</div>
                </div>
            {/each}
        </div>

        {#if error}
            <div class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                Error: {error}
            </div>
        {/if}

        <form class="space-y-4" onsubmit={handleCategoriesSubmit}>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1" for="categories">
                    Output from EBK
                </label>
                <textarea
                        autocomplete="off"
                        bind:value={categoriesInput}
                        class="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="categories"
                        rows="3"></textarea>
            </div>

            <button class="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!isInputValid || loading}
                    type="submit">
                Update
            </button>
        </form>
    </section>
</main>
