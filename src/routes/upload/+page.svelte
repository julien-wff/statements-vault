<script lang="ts">
    import UploadForm from '$lib/components/upload/UploadForm.svelte';
    import UploadProgress from '$lib/components/upload/UploadProgress.svelte';

    let bank = $state('');
    let account = $state('');
    let files = $state<File[]>([]);

    function handleSubmit(data: { bank: string, account: string, files: File[] }) {
        bank = data.bank;
        account = data.account;
        files = data.files;
    }
</script>

<svelte:head>
    <title>Upload statements | Statements Vault</title>
</svelte:head>

<main class="h-screen grid place-content-center bg-slate-100">
    {#if files.length === 0}
        <UploadForm onsubmit={handleSubmit}/>
    {:else}
        <UploadProgress {files} {bank} {account}/>
    {/if}
</main>
