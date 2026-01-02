<script lang="ts">
    import type { Component, Snippet } from 'svelte';

    interface Props {
        title: string;
        value: string | number;
        icon: Component<any>;
        iconClass?: string;
        valueClass?: string;
        footer?: Snippet;
        href?: string;
    }

    let {
        title,
        value,
        icon: Icon,
        iconClass = 'bg-blue-50 text-blue-600',
        valueClass = '',
        footer,
        href,
    }: Props = $props();
</script>

{#snippet card()}
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
            <div class="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</div>
            <div class="{iconClass} p-2 rounded-lg">
                <Icon size={18}/>
            </div>
        </div>
        <div class="text-3xl font-black {valueClass}">{value}</div>
        {#if footer}
            {@render footer()}
        {/if}
    </div>
{/snippet}

{#if href}
    <a {href}>
        {@render card()}
    </a>
{:else}
    {@render card()}
{/if}
