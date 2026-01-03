<script lang="ts">
    import MetadataAccountForm from '$lib/components/metadata/MetadataAccountForm.svelte';
    import type { PageProps } from './$types';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Landmark from '@lucide/svelte/icons/landmark';

    let { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let accounts = $state(data.accounts);
</script>

<svelte:head>
    <title>Manage Accounts</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Manage Accounts</h1>
                <p class="text-sm text-slate-500 font-medium">Configure your bank accounts and sources</p>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-12">
                <MetadataAccountForm bind:accounts/>
            </div>
        </div>
    </div>
</main>
