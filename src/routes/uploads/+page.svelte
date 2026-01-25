<script lang="ts">
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import FileText from '@lucide/svelte/icons/file-text';
    import Landmark from '@lucide/svelte/icons/landmark';
    import Upload from '@lucide/svelte/icons/upload';
    import { getAllFiles } from '$lib/api/files.remote';
    import { BANKS } from '$lib/utils/constants';

    const files = $derived(await getAllFiles());
</script>

<svelte:head>
    <title>All Uploads | Statements Vault</title>
</svelte:head>

<main class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-8">
        <header class="flex items-center gap-3">
            <a class="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
               href="/">
                <ChevronLeft size={20}/>
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">All Uploads</h1>
                <p class="text-sm text-slate-500 font-medium">View all your uploaded bank statements</p>
            </div>
        </header>

        <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {files.length} File{files.length !== 1 ? 's' : ''} Uploaded
                </h2>
                <a class="text-xs text-blue-600 font-bold uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-1"
                   href="/upload">
                    <Upload size={12}/>
                    Upload New
                </a>
            </div>

            {#if files.length === 0}
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <div class="bg-slate-100 p-4 rounded-2xl inline-block mb-4">
                        <FileText size={32} class="text-slate-400"/>
                    </div>
                    <h3 class="text-lg font-bold text-slate-700 mb-2">No uploads yet</h3>
                    <p class="text-sm text-slate-500 mb-4">Upload your first bank statement to get started</p>
                    <a class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                       href="/upload">
                        <Upload size={16}/>
                        Upload Statement
                    </a>
                </div>
            {:else}
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                            <tr class="bg-slate-50/50 border-b border-slate-100">
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Source File
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                    Date
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                    Transactions
                                </th>
                                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-50">
                            {#each files as file}
                                <tr class="hover:bg-slate-50/50 transition-colors group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="bg-slate-100 p-1.5 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <FileText size={16}/>
                                            </div>
                                            <div class="min-w-0">
                                                <span class="text-sm font-bold text-slate-700 truncate block max-w-72">
                                                    {file.name}
                                                </span>
                                                {#if file.accountBank && file.accountName}
                                                    <span class="inline-flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                        <Landmark size={10} class="text-slate-400"/>
                                                        <span class="truncate">{file.accountName}</span>
                                                        <span class="text-slate-300">·</span>
                                                        <span class="text-slate-400">{BANKS[file.accountBank].name}</span>
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        {#if file.date}
                                            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {new Date(file.date).toLocaleDateString()}
                                            </span>
                                        {/if}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <span class="text-sm font-black text-slate-600">
                                            {file.transactions}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <a href="/uploads/{file.id}"
                                           class="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                            Inspect
                                        </a>
                                    </td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</main>
