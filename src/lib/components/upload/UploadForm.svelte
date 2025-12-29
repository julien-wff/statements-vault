<script lang="ts">
    import { BANKS } from '$lib/utils/constants';
    import { getAccounts } from '$lib/api/metadata/accounts.remote';

    interface Props {
        onsubmit?: (data: {
            bank: keyof typeof BANKS;
            account: string;
            files: File[];
        }) => void;
    }

    let { onsubmit }: Props = $props();

    let bank = $state<null | keyof typeof BANKS>(null);
    let account = $state<null | string>(null);
    let files = $state<FileList | null>(null);

    const accounts = $derived(await getAccounts());

    function handleSubmit(ev: Event) {
        ev.preventDefault();
        onsubmit?.({
            bank: bank!,
            account: account!,
            files: [ ...(files ?? []) ],
        });
    }
</script>

<section class="p-6 bg-white rounded shadow-md w-96">
    <h1 class="text-2xl font-bold mb-4">Upload Statements</h1>
    <form class="space-y-4" onsubmit={handleSubmit}>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="bank">
                Bank
            </label>
            <select bind:value={bank}
                    class="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="bank"
                    required>
                <option disabled value={null}>Select your bank</option>
                {#each Object.entries(BANKS) as [ key, bankInfo ]}
                    <option value={key}>{bankInfo.name}</option>
                {/each}
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="account">
                Account
            </label>
            <select bind:value={account}
                    class="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                    disabled={bank === null}
                    id="account"
                    required>
                <option disabled value={null}>Select an account</option>
                {#each accounts.filter(acc => acc.bank === bank) as acc}
                    <option value={acc.id}>{acc.name}</option>
                {/each}
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="statements">
                Statement files
            </label>
            <input accept={bank ? BANKS[bank].acceptedFormats.join(',') : undefined}
                   bind:files
                   class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-200 disabled:file:text-gray-400"
                   disabled={bank === null}
                   id="statements"
                   multiple
                   name="statements"
                   required
                   type="file"/>
        </div>

        <button class="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                type="submit">
            Upload
        </button>
    </form>
</section>