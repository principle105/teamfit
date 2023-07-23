<script lang="ts">
    import { page } from "$app/stores";
    import type { User } from "$lib/types";
    import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
    import { signOut } from "@auth/sveltekit/client";

    let isDropdownOpen: boolean = false;

    import Logo from "$lib/images/logo_small.png";

    const user = $page.data.session?.user as User;
</script>

<header class="flex justify-between items-center w-[86%] mx-auto py-7">
    <a href="/" class="flex items-center gap-4">
        <img src={Logo} alt="Teamfit logo" class="h-14" />
        <span class="text-2xl text-zinc-700">TeamFit</span>
    </a>

    <!-- <nav>
        <ul class="flex gap-10">
            <li><a href="/">Home</a></li>
            <li><a href="/protected">Protected</a></li>
        </ul>
    </nav> -->
    {#if user}
        <div class="relative">
            <button
                class="flex gap-3.5 items-center"
                on:click={() => (isDropdownOpen = !isDropdownOpen)}
            >
                {#if user?.image}
                    <img
                        src={user.image}
                        alt="{user.firstName}'s avatar"
                        class="w-10 h-10 rounded-full"
                    />
                {/if}
                <div class="font-medium text-[1.08rem] hidden sm:block">
                    {user.firstName}
                </div>
                <div class="h-5 w-5">
                    <IoIosArrowDown />
                </div>
            </button>

            <div
                class="absolute {isDropdownOpen ||
                    'opacity-0'} transition-opacity top-[calc(100%+0.8rem)] right-0 bg-white rounded-lg shadow-lg p-4"
            >
                <a
                    href="/"
                    class="block py-2 px-4 hover:bg-zinc-100 rounded-lg"
                >
                    Dashboard
                </a>
                <a
                    href="/profile"
                    class="block py-2 px-4 hover:bg-zinc-100 rounded-lg"
                >
                    Profile
                </a>
                <button
                    class="block py-2 px-4 hover:bg-zinc-100 rounded-lg"
                    on:click={signOut}
                >
                    Sign out
                </button>
            </div>
        </div>
    {:else}
        <a href="/auth/signin" data-sveltekit-preload-data="off">Sign in</a>
    {/if}
</header>
