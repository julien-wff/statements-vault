<script lang="ts">
    import ArrowRight from '@lucide/svelte/icons/arrow-right';
    import Download from '@lucide/svelte/icons/download';
    import type { Component } from 'svelte';

    interface Action {
        label: string;
        icon: Component<any>;
        href: string;
        color: string;
    }

    interface Props {
        actions: Action[];
    }

    let { actions }: Props = $props();
</script>

<div class="space-y-4">
    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
        Quick Actions
    </h2>
    <div class="grid grid-cols-1 gap-3">
        {#each actions as action}
            {@const Icon = action.icon}
            <a href={action.href}
               class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group">
                <div class="flex items-center gap-4">
                    <div class={`${action.color} text-white p-2.5 rounded-xl shadow-sm`}>
                        <Icon size={20}/>
                    </div>
                    <span class="font-bold text-slate-700 tracking-tight">{action.label}</span>
                </div>
                <ArrowRight size={18}
                            class="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"/>
            </a>
        {/each}

        <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 opacity-60">
            <div class="flex items-center gap-4">
                <div class="bg-slate-400 text-white p-2.5 rounded-xl">
                    <Download size={20}/>
                </div>
                <span class="font-bold text-slate-500 tracking-tight">Export Data</span>
            </div>
            <span class="text-[10px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Coming Soon</span>
        </div>
    </div>
</div>
