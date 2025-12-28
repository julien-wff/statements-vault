<script lang="ts">
    import type { account, banksEnum } from '$lib/server/db/schema';
    import { deleteAccount, saveAccount } from '$lib/api/metadata/accounts.remote';
    import { BANKS } from '$lib/utils/constants';
    import { onMount } from 'svelte';

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

<form class="p-2 bg-blue-50 rounded-lg shadow space-y-2" onsubmit={handleSave}>
    <input bind:value={accountData.name}
           class="block w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
           placeholder="Account Name"
           required/>

    <select bind:value={accountData.bank}
            class="block w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
            required>
        <option disabled value={null}>Select a bank</option>
        {#each Object.entries(BANKS) as [ key, bankInfo ]}
            <option value={key}>{bankInfo.name}</option>
        {/each}
    </select>

    <div class="grid grid-cols-2 gap-2">
        <button class="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saveLoading || !isModified}
                type="submit">
            Save
        </button>
        <button class="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading}
                onclick={handleDelete}
                type="button">
            Delete
        </button>
    </div>
</form>
