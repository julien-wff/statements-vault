<script lang="ts">
    import X from '@lucide/svelte/icons/x';

    interface SubCategory {
        id: string;
        name: string;
        categoryName: string;
        categoryType: string;
    }

    interface Props {
        subcategories: SubCategory[];
        selectedSubCategoryId: string;
        suggestedType?: string;
    }

    let { subcategories, selectedSubCategoryId = $bindable(''), suggestedType }: Props = $props();

    let searchInput = $state('');
    let isFocused = $state(false);
    let focusedIndex = $state(0);

    const filteredSubCategories = $derived(
        searchInput.length > 0
            ? subcategories.filter(sub =>
                sub.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                sub.categoryName.toLowerCase().includes(searchInput.toLowerCase()),
            ).toSorted((a, b) => {
                if (a.categoryType === suggestedType && b.categoryType !== suggestedType) return -1;
                if (a.categoryType !== suggestedType && b.categoryType === suggestedType) return 1;
                return a.name.localeCompare(b.name);
            })
            : subcategories.toSorted((a, b) => {
                if (a.categoryType === suggestedType && b.categoryType !== suggestedType) return -1;
                if (a.categoryType !== suggestedType && b.categoryType === suggestedType) return 1;
                return a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name);
            }),
    );

    $effect(() => {
        if (searchInput) focusedIndex = 0;
    });

    $effect(() => {
        if (!selectedSubCategoryId) {
            searchInput = '';
        } else {
            const sub = subcategories.find(s => s.id === selectedSubCategoryId);
            if (sub) {
                searchInput = `${sub.categoryName} > ${sub.name}`;
            }
        }
    });

    function handleKeyDown(e: KeyboardEvent) {
        if (!searchInput || selectedSubCategoryId) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedIndex = (focusedIndex + 1) % filteredSubCategories.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedIndex = (focusedIndex - 1 + filteredSubCategories.length) % filteredSubCategories.length;
        } else if (e.key === 'Enter' && filteredSubCategories[focusedIndex]) {
            e.preventDefault();
            const sub = filteredSubCategories[focusedIndex];
            selectedSubCategoryId = sub.id;
        }
    }
</script>

<div class="space-y-2">
    <label class="text-xs font-black text-slate-400 uppercase tracking-widest"
           for="subcategory">
        Select Subcategory
    </label>
    <div class="relative">
        <!-- svelte-ignore a11y_autofocus -->
        <input
                autofocus
                bind:value={searchInput}
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                onblur={() => setTimeout(() => isFocused = false, 200)}
                onfocus={() => isFocused = true}
                onkeydown={handleKeyDown}
                placeholder="Search categories (e.g. Food, Rent...)"
                type="text"/>

        {#if isFocused && !selectedSubCategoryId}
            <div class="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden p-1">
                {#each filteredSubCategories as sub, i}
                    <button
                            type="button"
                            onclick={() => {
                                selectedSubCategoryId = sub.id;
                            }}
                            class="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group transition-colors {i === focusedIndex ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}"
                    >
                        <div>
                            <div class="text-sm font-bold {i === focusedIndex ? 'text-blue-700' : 'text-slate-700'}">{sub.name}</div>
                            <div class="text-[10px] text-slate-400 uppercase font-black">{sub.categoryName}</div>
                        </div>
                        <div class="text-[10px] font-black px-2 py-1 rounded transition-colors {i === focusedIndex ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}">
                            {sub.categoryType}
                        </div>
                    </button>
                {:else}
                    <div class="px-4 py-8 text-center text-slate-400 text-sm italic">
                        No categories matching "{searchInput}"
                    </div>
                {/each}
            </div>
        {:else if selectedSubCategoryId}
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                        type="button"
                        onclick={() => {
                            selectedSubCategoryId = '';
                        }}
                        class="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                >
                    <X size={16}/>
                </button>
            </div>
        {/if}
    </div>
</div>
