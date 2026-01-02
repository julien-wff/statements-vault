<script lang="ts">
    import Calendar from '@lucide/svelte/icons/calendar';
    import Landmark from '@lucide/svelte/icons/landmark';
    import Search from '@lucide/svelte/icons/search';
    import SquareAsterisk from '@lucide/svelte/icons/square-asterisk';
    import { cleanTransactionDescription } from '$lib/utils/transactions';

    interface Transaction {
        id: number;
        date: Date;
        description: string;
        amount: number;
        currency: string;
        account: {
            name: string;
        };
    }

    interface Props {
        transactions: Transaction[];
        matchingIdsFromPattern?: number[];
        onsetpattern?: (pattern: string) => void;
    }

    let { transactions, matchingIdsFromPattern, onsetpattern }: Props = $props();

    const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        weekday: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
</script>

<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="overflow-x-auto max-h-[calc(100vh-150px)] overflow-y-auto">
        <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 z-10">
            <tr class="bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                </th>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                </th>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Amount
                </th>
            </tr>
            </thead>

            <tbody class="divide-y divide-slate-50">
            {#each transactions as tr}
                {@const cleanDesc = cleanTransactionDescription(tr.description)}
                {@const isMatching = matchingIdsFromPattern?.includes(tr.id)}
                <tr class="hover:bg-slate-50/50 transition-colors group {isMatching ? 'bg-emerald-50/50 hover:bg-emerald-100/50!' : ''}">
                    <td class="px-6 py-4 space-y-1">
                        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                             title={fullDateFormatter.format(tr.date)}>
                            <Calendar size={12} class="text-slate-400"/>
                            {tr.date.toLocaleDateString()}
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            <Landmark size={12}/>
                            <span class="whitespace-nowrap">
                                {tr.account?.name}
                                </span>
                        </div>
                    </td>

                    <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 font-medium line-clamp-2 leading-snug"
                              title={tr.description}>
                            {tr.description}
                            <a href="https://google.com/search?q={encodeURIComponent(cleanDesc)}"
                               target="_blank"
                               class="cursor-pointer"
                               rel="noopener noreferrer">
                                <Search size={14} class="text-blue-600 inline -translate-y-0.5"/>
                            </a>
                            <SquareAsterisk size={14} class="cursor-pointer -translate-y-0.5 text-purple-600 inline"
                                            onclick={() => onsetpattern?.(`%${cleanDesc}%`)}/>
                        </span>
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
