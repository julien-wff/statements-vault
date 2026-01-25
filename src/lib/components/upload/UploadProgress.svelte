<script lang="ts">
    import { SvelteSet } from 'svelte/reactivity';
    import { onMount, tick } from 'svelte';
    import { page } from '$app/state';
    import Upload from '@lucide/svelte/icons/upload';
    import Check from '@lucide/svelte/icons/check';
    import X from '@lucide/svelte/icons/x';
    import Loader2 from '@lucide/svelte/icons/loader-2';
    import { applyAllRulesToAllTransactions } from '$lib/api/metadata/category-rules.remote';

    interface Props {
        files: File[];
        bank: string;
        account: string;
    }

    let { files, bank, account }: Props = $props();

    let listEl: HTMLDivElement;
    let uploadedFiles = new SvelteSet<string>();
    let errorFiles = new SvelteSet<string>();
    let currentUploadIndex = $state(0);
    let uploadComplete = $state(false);
    let classifiedCount = $state<number | null>(null);
    let isClassifying = $state(false);

    async function scrollToFile(fileIndex: number) {
        await tick();
        const el = listEl?.querySelector<HTMLDivElement>(`[data-index="${fileIndex}"]`);
        el?.scrollIntoView({ behavior: 'instant', block: 'end' });
    }

    async function applyRules() {
        isClassifying = true;
        try {
            classifiedCount = await applyAllRulesToAllTransactions();
        } catch (e) {
            console.error('Failed to apply rules:', e);
            classifiedCount = 0;
        } finally {
            isClassifying = false;
        }
    }

    async function uploadFileByIndex(fileIndex: number) {
        if (fileIndex >= files.length) {
            uploadComplete = true;
            await applyRules();
            return;
        }

        const file = files[fileIndex];
        await scrollToFile(fileIndex);
        currentUploadIndex = fileIndex;

        await fetch(page.url, {
            method: 'POST',
            body: (() => {
                const formData = new FormData();
                formData.append('bank', bank);
                formData.append('account', account);
                formData.append('file', file);
                return formData;
            })(),
        }).then((res) => {
            if (res.ok) {
                uploadedFiles.add(file.name);
                return uploadFileByIndex(fileIndex + 1);
            } else {
                errorFiles.add(file.name);
            }
        }).catch(() => {
            errorFiles.add(file.name);
        });
    }

    onMount(() => {
        uploadFileByIndex(0);
    });
</script>

<section class="p-6 bg-white rounded-xl shadow-lg shadow-slate-200">
    <div class="flex items-center gap-3 mb-6">
        <div class="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
            <Upload size={24}/>
        </div>
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Uploading files</h1>
            <p class="text-sm text-slate-500 font-medium">{files.length} file{files.length === 1 ? '' : 's'} in
                progress</p>
        </div>
    </div>

    <div bind:this={listEl} class="space-y-3 max-h-64 overflow-y-auto">
        {#each files as file, i (file.name)}
            <div class="flex gap-3 items-center p-2 rounded-lg bg-slate-50" data-index={i}>
                {#if uploadedFiles.has(file.name)}
                    <div class="size-5 border-2 border-green-500 bg-green-500 rounded-full flex items-center justify-center">
                        <Check class="text-white" size={12}/>
                    </div>
                {:else if errorFiles.has(file.name)}
                    <div class="size-5 border-2 border-red-500 bg-red-500 rounded-full flex items-center justify-center">
                        <X class="text-white" size={12}/>
                    </div>
                {:else}
                    <Loader2 class="animate-spin {currentUploadIndex === i ? 'text-blue-500' : 'text-slate-400'}"
                             size={20}/>
                {/if}
                <p class="text-slate-700 flex-1 line-clamp-1 text-sm font-medium">{file.name}</p>
            </div>
        {/each}
    </div>

    {#if uploadComplete}
        <div class="mt-4 p-3 rounded-lg bg-slate-50 text-center">
            {#if isClassifying}
                <div class="flex items-center justify-center gap-2 text-slate-600">
                    <Loader2 class="animate-spin" size={16}/>
                    <span class="text-sm font-medium">Classifying transactions...</span>
                </div>
            {:else if classifiedCount !== null}
                <p class="text-sm font-medium text-green-600">
                    {classifiedCount} transaction{classifiedCount === 1 ? '' : 's'} automatically classified
                </p>
            {/if}
        </div>
    {/if}

    <a class="block text-center mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer transition-colors"
       class:bg-slate-400={!uploadComplete || isClassifying}
       class:pointer-events-none={!uploadComplete || isClassifying}
       class:shadow-slate-200={!uploadComplete || isClassifying}
       href="/">
        Done
    </a>
</section>
