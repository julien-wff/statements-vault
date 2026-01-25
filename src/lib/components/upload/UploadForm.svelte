<script lang="ts">
    import Upload from '@lucide/svelte/icons/upload';
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

<section class="p-6 bg-white rounded-xl shadow-lg shadow-slate-200">
    <div class="flex items-center gap-3 mb-6">
        <div class="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
            <Upload size={24}/>
        </div>
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Upload Statements</h1>
            <p class="text-sm text-slate-500 font-medium">Import your bank statements</p>
        </div>
    </div>

    <form class="space-y-5" onsubmit={handleSubmit}>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="bank">
                Bank
            </label>
            <select bind:value={bank}
                    class="block w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    id="bank"
                    required>
                <option disabled value={null}>Select your bank</option>
                {#each Object.entries(BANKS) as [ key, bankInfo ]}
                    <option value={key}>{bankInfo.name}</option>
                {/each}
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="account">
                Account
            </label>
            <select bind:value={account}
                    class="block w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="statements">
                Statement files
            </label>
            <input accept={bank ? BANKS[bank].acceptedFormats.join(',') : undefined}
                   bind:files
                   class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer file:transition-colors disabled:file:bg-slate-100 disabled:file:text-slate-400 disabled:file:cursor-not-allowed"
                   disabled={bank === null}
                   id="statements"
                   multiple
                   name="statements"
                   required
                   type="file"/>
        </div>

        <button class="w-full cursor-pointer bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
                type="submit">
            Upload
        </button>
    </form>
</section>