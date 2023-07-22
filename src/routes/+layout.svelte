<script lang="ts">
    import { Toaster } from "svelte-french-toast";

    import Header from "./Header.svelte";

    import "./global.css";
</script>

<Header />

<main class="w-[86%] mx-auto">
    <slot />
</main>

<Toaster />
