<script lang="ts">
    import { Toaster } from "svelte-french-toast";
    import { page } from "$app/stores";
    import type { User } from "$lib/types";

    import Header from "./Header.svelte";
    import Survey from "./Survey.svelte";

    import "./global.css";

    let user = $page.data.session?.user as User;
</script>

<Header />

<main class="w-[86%] mx-auto h-full grow">
    {#if user && !user.surveyCompleted}
        <Survey bind:user />
    {:else}
        <slot />
    {/if}
</main>

<Toaster />
