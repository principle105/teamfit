<script lang="ts">
    import { page } from "$app/stores";
    import type { User } from "$lib/types";
    import { signOut } from "@auth/sveltekit/client";

    import Logo from "$lib/images/logo_small.png";

    const user = $page.data.session?.user as User;
</script>

<header class="flex justify-between items-center w-[86%] mx-auto py-7">
    <a href="/" class="flex items-center gap-4">
        <img src={Logo} alt="Teamfit logo" class="h-14" />
        <span class="text-2xl text-zinc-700">TeamFit</span>
    </a>

    <nav>
        <ul class="flex gap-10">
            <li><a href="/">Home</a></li>
            <li><a href="/protected">Protected</a></li>
        </ul>
    </nav>
    {#if user}
        <div class="flex gap-4 items-center">
            {#if user?.image}
                <img
                    src={user.image}
                    alt="{user.name}'s avatar"
                    class="w-10 h-10 rounded-full"
                />
            {/if}
            <div class="font-semibold">{user.name}</div>
            <button on:click={signOut}> Sign out </button>
        </div>
    {:else}
        <a href="/auth/signin" data-sveltekit-preload-data="off"> Sign in </a>
    {/if}
</header>
