<script lang="ts">
    import ArrowRight from '@lucide/svelte/icons/arrow-right';
    import CircleAlert from '@lucide/svelte/icons/circle-alert';
    import CircleCheck from '@lucide/svelte/icons/circle-check';
    import Download from '@lucide/svelte/icons/download';
    import FileText from '@lucide/svelte/icons/file-text';
    import Landmark from '@lucide/svelte/icons/landmark';
    import Tag from '@lucide/svelte/icons/tag';
    import Upload from '@lucide/svelte/icons/upload';
    import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
    import StatCard from '$lib/components/dashboard/StatCard.svelte';
    import QuickActions from '$lib/components/dashboard/QuickActions.svelte';
    import RecentUploads from '$lib/components/dashboard/RecentUploads.svelte';
    import { getFilesCount, getLatestFiles } from '$lib/api/files.remote';
    import { getAccounts } from '$lib/api/metadata/accounts.remote';
    import { getTransactionsCount, getUncategorizedTransactionsCount } from '$lib/api/transactions.remote';

    const transactionsCount = $derived(await getTransactionsCount());
    const uncategorizedCount = $derived(await getUncategorizedTransactionsCount());
    const filesCount = $derived(await getFilesCount());
    const accounts = $derived(await getAccounts());
    const recentFiles = $derived(await getLatestFiles());

    const quickActions = [
        { label: 'Upload Statements', icon: Upload, href: '/upload', color: 'bg-green-600' },
        { label: 'Manage Categories', icon: Tag, href: '/metadata/categories', color: 'bg-purple-600' },
        { label: 'Manage Accounts', icon: Landmark, href: '/metadata/accounts', color: 'bg-indigo-600' },
        { label: 'Export Transactions', icon: Download, href: '/', color: 'bg-amber-600' },
    ];
</script>

<svelte:head>
    <title>Dashboard | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <DashboardHeader/>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileText} title="Transactions" value={transactionsCount}>
                {#snippet footer()}
                    <div class="flex items-center gap-1 text-xs text-slate-400 mt-2">
                        <CircleCheck class="text-green-500" size={12}/>
                        <span>All records synchronized</span>
                    </div>
                {/snippet}
            </StatCard>

            <StatCard href="/categorize"
                      icon={CircleAlert}
                      iconClass="bg-amber-50 text-amber-600"
                      title="To Categorize"
                      value={uncategorizedCount}
                      valueClass="text-amber-600">
                {#snippet footer()}
                    {#if uncategorizedCount === 0}
                        <div class="flex items-center gap-1 text-xs text-slate-400 mt-2">
                            <CircleCheck class="text-green-500" size={12}/>
                            <span>All transactions categorized</span>
                        </div>
                    {:else}
                        <div class="text-xs text-amber-500 mt-2 font-semibold flex items-center gap-1">
                            Action required
                            <ArrowRight size={12}/>
                        </div>
                    {/if}
                {/snippet}
            </StatCard>

            <StatCard href="/metadata/accounts"
                      icon={Landmark}
                      iconClass="bg-indigo-50 text-indigo-600"
                      title="Accounts"
                      value={accounts.length}>
                {#snippet footer()}
                    <div class="text-xs text-slate-400 mt-2">Active sources</div>
                {/snippet}
            </StatCard>

            <StatCard href="/upload"
                      icon={Upload}
                      iconClass="bg-emerald-50 text-emerald-600"
                      title="Files"
                      value={filesCount}>
                {#snippet footer()}
                    <div class="text-xs text-slate-400 mt-2">Parsed statements</div>
                {/snippet}
            </StatCard>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <QuickActions actions={quickActions}/>
            </div>

            <div class="lg:col-span-2 space-y-8">
                <RecentUploads files={recentFiles}/>
            </div>
        </div>
    </div>
</main>
