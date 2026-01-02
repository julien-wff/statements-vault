<script lang="ts">
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import RefreshCw from '@lucide/svelte/icons/refresh-cw';

    interface Props {
        onrefresh?: () => void;
    }

    let { onrefresh }: Props = $props();
</script>

<header class="flex items-center justify-between">
    <div class="flex items-center gap-3">
        <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
           href="/">
            <ChevronLeft size={20}/>
        </a>
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Categorize Transactions</h1>
            <p class="text-sm text-slate-500 font-medium">Batch process similar entries</p>
        </div>
    </div>

    <button class="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 hover:bg-blue-200 transition-colors font-medium"
            onclick={onrefresh}>
        <RefreshCw size={16}/>
        <span class="text-sm font-bold">Refresh transactions</span>
    </button>
</header>
