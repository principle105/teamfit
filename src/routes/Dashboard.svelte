<script lang="ts">
    import type { User } from "$lib/types";

    export let user: User;
</script>

<h2>Dashboard</h2>
<p>Welcome {user.name}</p>
