<script lang="ts">
    import type { User, Friend } from "$lib/types";
    import { onMount } from "svelte";

    export let user: User;

    let matches: Friend[] = [];

    // TODO: maybe use a separate route

    onMount(async () => {
        const res = await fetch(`/api/users/find-match?userId=${user.id}`);
        const data = await res.json();

        matches = data.users;
    });
</script>

<section>
    <div class="text-center">
        <h2 class="text-4xl font-semibold">Potential Matches</h2>
        <p class="text-zinc-700">Here are some potential matches for you!</p>
    </div>
    {#if matches.length === 0}
        <p class="text-center">
            Sorry, no matches were found. Come back another time.
        </p>
    {:else}
        <ul>
            {#each matches as match}
                <li>
                    <h3>{match.name}</h3>
                    <p>{match.matchingGoals}</p>
                </li>
            {/each}
        </ul>
    {/if}
</section>
