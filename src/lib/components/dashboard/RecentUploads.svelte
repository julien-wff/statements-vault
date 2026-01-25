<script lang="ts">
    import FileText from '@lucide/svelte/icons/file-text';
    import { BANKS } from '$lib/utils/constants';
    import type { banksEnum } from '$lib/server/db/schema';

    interface FileEntry {
        id: number;
        name: string;
        date: string | null;
        transactions: number;
        accountName: string | null;
        accountBank: (typeof banksEnum)[number] | null;
    }

    interface Props {
        files: FileEntry[];
    }

    let { files }: Props = $props();
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between px-1">
        <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Uploads</h2>
        <a class="text-xs text-blue-600 font-bold uppercase tracking-widest hover:text-blue-700 transition-colors"
           href="/uploads">
            View All
        </a>
    </div>

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
                                            <span class="inline-flex items-center gap-1 text-xs text-slate-500">
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
                            <a class="block cursor-pointer text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                               href="/uploads/{file.id}">
                                Inspect
                            </a>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
