<script lang="ts">
    import MetadataAccountForm from '$lib/components/metadata/MetadataAccountForm.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let accounts = $state(data.accounts);
</script>

<svelte:head>
    <title>Manage Accounts</title>
</svelte:head>

<main class="h-screen grid place-content-center bg-slate-100">
    <MetadataAccountForm bind:accounts/>
</main>
