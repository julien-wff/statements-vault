<script lang="ts">
    import { getAllMetadata, restoreAllMetadata } from '$lib/api/metadata/metadata.remote';
    import Loader2 from '@lucide/svelte/icons/loader-2';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Database from '@lucide/svelte/icons/database';
    import Download from '@lucide/svelte/icons/download';
    import Upload from '@lucide/svelte/icons/upload';
    import CircleCheck from '@lucide/svelte/icons/circle-check';

    const metadata = $derived(await getAllMetadata());

    let restoreLoading = $state(false);
    let restoreError = $state<string | null>(null);
    let restoreSuccess = $state(false);

    let fileInput = $state<HTMLInputElement | null>(null);

    function handleDownload() {
        const blob = new Blob([ JSON.stringify(metadata, null, 2) ], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statements-vault-metadata-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
        }, 0);
    }

    function handleUploadClick() {
        fileInput?.click();
    }

    async function handleFileChange(ev: Event) {
        const input = ev.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        restoreLoading = true;
        restoreError = null;
        restoreSuccess = false;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await restoreAllMetadata(data);
            restoreSuccess = true;
        } catch (e) {
            console.error(e);
            restoreError = (e as any).body?.message || (e as Error).message || 'An unknown error occurred';
        } finally {
            restoreLoading = false;
            input.value = '';
        }
    }

    const stats = $derived({
        accounts: metadata.accounts.length,
        categories: metadata.categories.length,
        subCategories: metadata.categories.reduce((sum, c) => sum + c.subCategories.length, 0),
        rules: metadata.rules.length,
    });
</script>

<svelte:head>
    <title>Backup & Restore | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Backup & Restore</h1>
                <p class="text-sm text-slate-500 font-medium">Download or upload all metadata in one go</p>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Current stats -->
            <div class="lg:col-span-4 space-y-6">
                <section class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <Database class="text-indigo-600" size={20}/>
                        Current Data
                    </h3>
                    <div class="grid grid-cols-1 gap-3">
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounts</div>
                            <div class="text-2xl font-bold text-slate-800">{stats.accounts}</div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-slate-800">{stats.categories}</div>
                                <div class="text-xs text-slate-400 font-medium">
                                    {stats.subCategories} subcategories
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Rules</div>
                            <div class="text-2xl font-bold text-slate-800">{stats.rules}</div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Actions -->
            <div class="lg:col-span-8 space-y-6">
                <!-- Download -->
                <section class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-lg font-bold mb-2">Download Metadata</h3>
                    <p class="text-sm text-slate-500 mb-4">
                        Export all accounts, categories, subcategories, and category rules as a single JSON file.
                    </p>
                    <button class="w-full cursor-pointer bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-100"
                            onclick={handleDownload}>
                        <Download size={20}/>
                        Download All Metadata
                    </button>
                </section>

                <!-- Upload / Restore -->
                <section class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-lg font-bold mb-2">Restore Metadata</h3>
                    <p class="text-sm text-slate-500 mb-4">
                        Upload a previously exported JSON file to restore all metadata. Existing entries will be
                        updated, new entries will be created.
                    </p>

                    {#if restoreError}
                        <div class="mb-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            {restoreError}
                        </div>
                    {/if}

                    {#if restoreSuccess}
                        <div class="mb-4 p-4 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-medium flex items-center gap-2">
                            <CircleCheck size={16}/>
                            Metadata restored successfully!
                        </div>
                    {/if}

                    <input accept=".json,application/json"
                           bind:this={fileInput}
                           class="hidden"
                           onchange={handleFileChange}
                           type="file"
                    />

                    <button class="w-full cursor-pointer bg-amber-600 text-white py-3 px-6 rounded-xl hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2 shadow-sm shadow-amber-100"
                            disabled={restoreLoading}
                            onclick={handleUploadClick}>
                        {#if restoreLoading}
                            <Loader2 class="animate-spin" size={20}/>
                            Restoring...
                        {:else}
                            <Upload size={20}/>
                            Upload & Restore Metadata
                        {/if}
                    </button>
                </section>
            </div>
        </div>
    </div>
</main>
