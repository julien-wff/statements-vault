<script lang="ts">
    import type { account, banksEnum } from '$lib/server/db/schema';
    import { deleteAccount, saveAccount } from '$lib/api/metadata/accounts.remote';
    import { BANKS } from '$lib/utils/constants';
    import { onMount } from 'svelte';
    import Save from '@lucide/svelte/icons/save';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import Loader2 from '@lucide/svelte/icons/loader-2';

    interface Props {
        accountData: Omit<typeof account.$inferSelect, 'bank'> & {
            bank: typeof banksEnum[number] | null;
        };
        ondelete?: () => void;
    }

    let { accountData = $bindable(), ondelete }: Props = $props();

    let saveLoading = $state(false);
    let deleteLoading = $state(false);

    let savedData = $state<Omit<typeof account.$inferSelect, 'id'> | null>(null);
    const isModified = $derived.by(() => {
        if (savedData === null) {
            return true;
        }

        return (
            savedData.name !== accountData.name ||
            savedData.bank !== accountData.bank
        );
    });

    onMount(() => {
        if (accountData.bank === null) {
            return;
        }

        savedData = {
            name: accountData.name,
            bank: accountData.bank,
        };
    });

    async function handleDelete() {
        if (deleteLoading) {
            return;
        }

        deleteLoading = true;
        if (savedData) {
            await deleteAccount(accountData.id);
        }
        ondelete?.();
        deleteLoading = false;
    }

    async function handleSave(ev: Event) {
        ev.preventDefault();
        if (!accountData.bank || saveLoading) {
            return;
        }

        saveLoading = true;
        await saveAccount({
            id: accountData.id,
            name: accountData.name,
            bank: accountData.bank,
        });
        savedData = {
            name: accountData.name,
            bank: accountData.bank,
        };
        saveLoading = false;
    }
</script>

<form class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 hover:border-indigo-200 transition-colors group"
      onsubmit={handleSave}>
    <div class="space-y-3">
        <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1"
                   for="name-{accountData.id}">
                Account Name
            </label>
            <input bind:value={accountData.name}
                   class="block w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                   id="name-{accountData.id}"
                   placeholder="e.g. Main Checking"
                   required/>
        </div>

        <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1"
                   for="bank-{accountData.id}">
                Bank Provider
            </label>
            <select bind:value={accountData.bank}
                    class="block w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                    id="bank-{accountData.id}"
                    required>
                <option disabled value={null}>Select a bank</option>
                {#each Object.entries(BANKS) as [ key, bankInfo ]}
                    <option value={key}>{bankInfo.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="flex items-center gap-2 pt-2">
        <button class="flex-1 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-sm shadow-indigo-100"
                disabled={saveLoading || !isModified}
                type="submit">
            {#if saveLoading}
                <Loader2 class="animate-spin" size={16}/>
            {:else}
                <Save size={16}/>
            {/if}
            Save
        </button>
        <button class="cursor-pointer bg-white text-slate-400 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={deleteLoading}
                onclick={handleDelete}
                title="Delete account"
                type="button">
            {#if deleteLoading}
                <Loader2 class="animate-spin" size={16}/>
            {:else}
                <Trash2 size={16}/>
            {/if}
        </button>
    </div>
</form>
