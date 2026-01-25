<script lang="ts">
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import Calendar from '@lucide/svelte/icons/calendar';
    import FileText from '@lucide/svelte/icons/file-text';
    import Landmark from '@lucide/svelte/icons/landmark';
    import Tag from '@lucide/svelte/icons/tag';
    import CircleHelp from '@lucide/svelte/icons/circle-help';
    import { page } from '$app/state';
    import { getFileDetailsById } from '$lib/api/files.remote';
    import { BANKS } from '$lib/utils/constants';
    import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';

    const fileId = $derived(parseInt(page.params.id ?? ''));
    const file = $derived(await getFileDetailsById(fileId));

    const transactions = $derived(file.transactions);

    const accountInfo = $derived(transactions[0]?.account);
    const bankName = $derived(accountInfo?.bank ? BANKS[accountInfo.bank]?.name : null);

    const totalIncome = $derived(
        transactions.filter(tr => tr.amount >= 0).reduce((sum, tr) => sum + tr.amount, 0)
    );
    const totalExpenses = $derived(
        transactions.filter(tr => tr.amount < 0).reduce((sum, tr) => sum + Math.abs(tr.amount), 0)
    );
    const categorizedCount = $derived(
        transactions.filter(tr => tr.subCategory).length
    );

    const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        weekday: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
</script>

<svelte:head>
    <title>{file.name} | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/uploads">
                <ChevronLeft size={20}/>
            </a>
            <div class="min-w-0 flex-1">
                <h1 class="text-2xl font-bold tracking-tight truncate" title={file.name}>{file.name}</h1>
                <div class="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    {#if accountInfo}
                        <Landmark size={14} class="text-slate-400"/>
                        <span>{accountInfo.name}</span>
                        {#if bankName}
                            <span class="text-slate-300">·</span>
                            <span class="text-slate-400">{bankName}</span>
                        {/if}
                    {/if}
                </div>
            </div>
        </header>

        <!-- Stats Overview -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div class="flex items-center gap-3 mb-2">
                    <div class="bg-blue-50 p-2 rounded-xl">
                        <FileText size={18} class="text-blue-600"/>
                    </div>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Transactions</span>
                </div>
                <p class="text-2xl font-black text-slate-800">{transactions.length}</p>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div class="flex items-center gap-3 mb-2">
                    <div class="bg-emerald-50 p-2 rounded-xl">
                        <Tag size={18} class="text-emerald-600"/>
                    </div>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Categorized</span>
                </div>
                <p class="text-2xl font-black text-slate-800">
                    {categorizedCount}
                    <span class="text-sm font-medium text-slate-400">/ {transactions.length}</span>
                </p>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div class="flex items-center gap-3 mb-2">
                    <div class="bg-green-50 p-2 rounded-xl">
                        <span class="text-green-600 font-black text-sm">+</span>
                    </div>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Income</span>
                </div>
                <p class="text-2xl font-black text-emerald-600">
                    +{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div class="flex items-center gap-3 mb-2">
                    <div class="bg-red-50 p-2 rounded-xl">
                        <span class="text-red-600 font-black text-sm">−</span>
                    </div>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Expenses</span>
                </div>
                <p class="text-2xl font-black text-slate-700">
                    -{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>

        <!-- Transactions Table -->
        <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    All Transactions
                </h2>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="sticky top-0 z-10">
                        <tr class="bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Date
                            </th>
                            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Description
                            </th>
                            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Category
                            </th>
                            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                Amount
                            </th>
                        </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-50">
                        {#each transactions as tr}
                            {@const subCat = tr.subCategory}
                            {@const cat = subCat?.category}
                            <tr class="hover:bg-slate-50/50 transition-colors group">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                                         title={fullDateFormatter.format(new Date(tr.date))}>
                                        <Calendar size={12} class="text-slate-400"/>
                                        {new Date(tr.date).toLocaleDateString()}
                                    </div>
                                    <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1">
                                        <Landmark size={10}/>
                                        <span class="whitespace-nowrap">{tr.account?.name}</span>
                                    </div>
                                </td>

                                <td class="px-6 py-4">
                                    <span class="text-sm text-slate-600 font-medium line-clamp-2 leading-snug"
                                          title={tr.description}>
                                        {tr.description}
                                    </span>
                                </td>

                                <td class="px-6 py-4">
                                    {#if subCat && cat}
                                        <div class="flex items-center gap-2">
                                            <div class="size-8 rounded-full flex items-center justify-center"
                                                 style="background: color-mix(in oklab, #{subCat.color} 20%, transparent 80%);">
                                                <i class="{subCat.icon} text-lg" style="color: #{subCat.color};"></i>
                                            </div>
                                            <div>
                                                <div class="text-sm font-bold text-slate-700">
                                                    {subCat.name}
                                                </div>
                                                <div class="text-[10px] text-slate-400 uppercase font-black">
                                                    {cat.name}
                                                </div>
                                            </div>
                                        </div>
                                    {:else}
                                        <div class="flex items-center gap-2 text-slate-400">
                                            <div class="size-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                <CircleHelp size={16}/>
                                            </div>
                                            <span class="text-xs font-medium italic">Uncategorized</span>
                                        </div>
                                    {/if}
                                </td>

                                <td class="px-6 py-4 text-right">
                                    <span class="text-sm font-black whitespace-nowrap"
                                          class:text-slate-700={tr.amount < 0}
                                          class:text-emerald-600={tr.amount >= 0}>
                                        {tr.amount < 0 ? '' : '+'}{tr.amount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                        <span class="text-[10px] ml-0.5 opacity-70">{tr.currency}</span>
                                    </span>
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
