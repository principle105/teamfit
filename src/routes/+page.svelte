<script lang="ts">
    import { page } from "$app/stores";
    import type { User } from "$lib/types";

    import Dashboard from "./Dashboard.svelte";
    import Landing from "./Landing.svelte";

    let user = $page.data.session?.user as User;
</script>

{#if user}
    <Dashboard bind:user />
{:else}
    <Landing />
{/if}
