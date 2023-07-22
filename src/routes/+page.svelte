<script lang="ts">
    import { page } from "$app/stores";
    import { surveyQuestions } from "$lib/surveyQuestions";
    import type { User } from "$lib/types";

    import Survey from "./Survey.svelte";
    import Dashboard from "./Dashboard.svelte";
    import Landing from "./Landing.svelte";
    import ChooseFriend from "./ChooseFriend.svelte";

    let user = $page.data.session?.user as User;
</script>

{#if user}
    {#if Object.keys(user.goals).length === surveyQuestions.length}
        {#if !user.friend}
            <ChooseFriend bind:user />
        {:else}
            <Dashboard bind:user />
        {/if}
    {:else}
        <Survey bind:user />
    {/if}
{:else}
    <Landing />
{/if}
