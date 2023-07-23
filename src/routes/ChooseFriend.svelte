<script lang="ts">
    import type { User, Friend } from "$lib/types";
    import { onMount } from "svelte";

    export let user: User;

    let matches: Friend[] = [];
    let loading: boolean = true;

    // TODO: maybe use a separate route

    onMount(async () => {
        const res = await fetch(`/api/users/find-match?userId=${user.id}`);
        const data = await res.json();

        matches = res.ok ? data.users : [];
        loading = false;
    });

    const sendPartnerRequest = () => {};
</script>

<section class="mt-10">
    <div class="text-center mb-10">
        <h2
            class="text-[2rem] sm:text-4xl md:text-5xl font-semibold mb-1.5 sm:mb-4"
        >
            Potential Matches
        </h2>
        <p class="text-zinc-600 text-sm sm:text-base">
            Here are some potential matches for you!
        </p>
    </div>
    {#if loading}
        <p class="text-center">Loading</p>
    {:else if matches.length === 0}
        <p class="text-center">
            Sorry, no matches were found. Come back another time.
        </p>
    {:else}
        <ul
            class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mx-auto"
        >
            {#each matches as match}
                {@const commonalities = match.matchingGoals.length}
                <li
                    class="items-center bg-zinc-50 border rounded-lg overflow-hidden border-zinc-200"
                >
                    <img
                        src={match.image}
                        alt="{match.name}'s profile picture"
                        class="w-full h-48 object-cover"
                    />
                    <div class="p-4">
                        <h3 class="text-2xl">{match.name}</h3>
                        <div
                            class="text-sm mb-3 {commonalities > 4
                                ? 'text-green-400'
                                : commonalities > 2
                                ? 'text-yellow-400'
                                : 'text-red-500'}"
                        >
                            {match.matchingGoals.length} commonalit{commonalities >
                            1
                                ? "ies"
                                : "y"}
                        </div>
                        <button
                            class="text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded-lg text-sm px-5 py-2.5"
                            on:click={sendPartnerRequest}
                        >
                            Send Partner Request
                        </button>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</section>
