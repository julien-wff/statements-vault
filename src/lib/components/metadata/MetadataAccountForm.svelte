<script lang="ts">
    import type { account, banksEnum } from '$lib/server/db/schema';
    import MetadataAccountElement from '$lib/components/metadata/MetadataAccountElement.svelte';

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

<section class="p-6 bg-white rounded shadow-md w-xl">
    <h1 class="text-2xl font-bold mb-4">Accounts</h1>
    <div class="space-y-4">
        <div>
            <div class="space-y-4">
                {#each accounts as _, i (accounts[i].id)}
                    <MetadataAccountElement bind:accountData={accounts[i]}
                                            ondelete={() => removeAccountFromList(accounts[i].id)}/>
                {/each}

                <button class="cursor-pointer w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onclick={handleAddAccount}
                        type="button">
                    Add Account
                </button>
            </div>
        </div>
    </div>
</section>
