<script lang="ts">
    import Check from '@lucide/svelte/icons/check';
    import ArrowRight from '@lucide/svelte/icons/arrow-right';
</script>

<div class="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
    <div class="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={32}/>
    </div>
    <h2 class="text-2xl font-bold text-slate-800">All caught up!</h2>
    <p class="text-slate-500 max-w-md mx-auto">
        There are no more uncategorized transactions to process at the moment.
    </p>
    <div class="pt-4">
        <a class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
           href="/">
            Return to Dashboard
            <ArrowRight size={18}/>
        </a>
    </div>
</div>
