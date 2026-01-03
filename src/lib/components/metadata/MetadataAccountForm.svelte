<script lang="ts">
    import type { account, banksEnum } from '$lib/server/db/schema';
    import MetadataAccountElement from '$lib/components/metadata/MetadataAccountElement.svelte';
    import Plus from '@lucide/svelte/icons/plus';
    import Landmark from '@lucide/svelte/icons/landmark';

    interface Props {
        accounts: Array<Omit<typeof account.$inferSelect, 'bank'> & {
            bank: typeof banksEnum[number] | null;
        }>;
    }

    let { accounts = $bindable() }: Props = $props();

    function handleAddAccount() {
        accounts = [
            ...accounts,
            {
                id: accounts.length + 1,
                name: '',
                bank: null,
            },
        ];
    }

    function removeAccountFromList(id: number) {
        accounts = accounts.filter((account) => account.id !== id);
    }
</script>

<section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 class="text-lg font-bold flex items-center gap-2">
            <Landmark class="text-indigo-600" size={20}/>
            Active Accounts
        </h3>
        <button class="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm shadow-indigo-100"
                onclick={handleAddAccount}
                type="button">
            <Plus size={18}/>
            Add Account
        </button>
    </div>

    <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {#each accounts as _, i (accounts[i].id)}
                <MetadataAccountElement bind:accountData={accounts[i]}
                                        ondelete={() => removeAccountFromList(accounts[i].id)}/>
            {/each}

            {#if accounts.length === 0}
                <div class="col-span-full py-12 text-center">
                    <div class="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Landmark class="text-slate-300" size={32}/>
                    </div>
                    <p class="text-slate-500 font-medium">No accounts configured yet</p>
                    <p class="text-sm text-slate-400">Add your first bank account to start tracking transactions</p>
                </div>
            {/if}
        </div>
    </div>
</section>
