<script lang="ts">
    import { SvelteSet } from 'svelte/reactivity';
    import { onMount, tick } from 'svelte';
    import { page } from '$app/state';

    interface Props {
        files: File[];
        bank: string;
        account: string;
    }

    let { files, bank, account }: Props = $props();

    let listEl: HTMLDivElement;
    let uploadedFiles = new SvelteSet<string>();
    let errorFiles = new SvelteSet<string>();
    let uploadComplete = $state(false);

    async function scrollToFile(fileIndex: number) {
        await tick();
        const el = listEl?.querySelector<HTMLDivElement>(`[data-index="${fileIndex}"]`);
        el?.scrollIntoView({ behavior: 'instant', block: 'end' });
    }

    async function uploadFileByIndex(fileIndex: number) {
        if (fileIndex >= files.length) {
            uploadComplete = true;
            return;
        }

        const file = files[fileIndex];
        await scrollToFile(fileIndex);

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

<section class="p-6 bg-white rounded shadow-md w-96">
    <h1 class="text-2xl font-bold mb-4">Uploading {files.length} file{files.length === 1 ? '' : 's'}...</h1>

    <div bind:this={listEl} class="space-y-2 max-h-64 overflow-y-auto">
        {#each files as file, i (file.name)}
            <div class="flex gap-2 items-center" data-index={i}>
                {#if uploadedFiles.has(file.name)}
                    <div class="mt-1 size-4 border-2 border-green-500 bg-green-500 rounded-full"></div>
                {:else if errorFiles.has(file.name)}
                    <div class="mt-1 size-4 border-2 border-red-500 bg-red-500 rounded-full"></div>
                {:else}
                    <div class="mt-1 size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                {/if}
                <p class="text-gray-700 flex-1 line-clamp-1">{file.name}</p>
            </div>
        {/each}
    </div>

    <a class="block text-center mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 cursor-pointer disabled:bg-gray-400"
       class:bg-gray-400={!uploadComplete}
       class:pointer-events-none={!uploadComplete}
       href="/">
        Done
    </a>
</section>
