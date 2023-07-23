<script lang="ts">
    import { onMount } from "svelte";
    import type { Post, User, Friend, Reply } from "$lib/types";
    import toast from "svelte-french-toast";
    import TextEditor from "./TextEditor.svelte";
    import type Quill from "quill";
    import { badges } from "$lib/data";
    import type { Badge } from "$lib/data";
    import IoIosGift from "svelte-icons/io/IoIosGift.svelte";

    export let user: User;

    interface BadgeInfo extends Badge {
        quantity: number;
    }

    let friend: Friend | null = null;
    let posts: Post[] = [];
    let badgeInfo: BadgeInfo[] = [];

    onMount(async () => {
        if (user.friend === null) {
            const res = await fetch(`/api/users/find-match?userId=${user.id}`);
            const data = await res.json();

            if (res.ok) {
                user.friend = data.match;
                toast.success("You have a new fitness partner!");
            } else {
                toast.error(
                    "Sorry, no matches were found. Come back another time."
                );
            }
        }

        if (user.friend === null) return;

        await getFriendData();
    });

    const getFriendData = async () => {
        // Getting the friend's data
        const friendRes = await fetch(
            `/api/partner/get-data?partnerId=${user.friend}`
        );

        const friendData = await friendRes.json();

        if (friendRes.ok) {
            friend = friendData.partner;
        } else {
            toast.error(
                "Failed to get your fitness partner's data. Please try again later."
            );
        }
    };

    let editor: Quill;
    let replyEditor: Quill;

    const postProgressUpdate = async () => {
        const content = editor.getContents();

        if (content.length() === 1) {
            toast.error("Please write something before posting");
            return;
        }

        const post: Post = {
            userId: user.id,
            content,
            date: Date.now(),
            replies: [],
            badges: [],
        };

        const postResponse = await fetch(`/api/posts/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(post),
        });

        if (!postResponse.ok) {
            toast.error("Results could not be saved");
        } else {
            user.posts = [...user.posts, post];
            user.points += 5;
            toast.success("Post created!");

            // Clearing the editor
            editor.setContents([] as any);

            getFriendData();
        }
    };

    $: friend?.posts, (posts = sortPosts());
    $: user.posts, (posts = sortPosts());

    const sortPosts = () => {
        // Sort yours and your friend's posts by date
        let allPosts =
            friend === null ? user.posts : [...user.posts, ...friend.posts];

        allPosts.sort((a, b) => {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            return 0;
        });

        return allPosts;
    };

    const sortBadges = (): BadgeInfo[] => {
        // Count the number of each badge that the user has
        const badgeCounts = user.badges.reduce(
            (acc: { [key: string]: number }, badge) => {
                if (acc[badge] === undefined) {
                    acc[badge] = 1;
                } else {
                    acc[badge]++;
                }

                return acc;
            },
            {}
        );

        // Getting the badge information and quantity for each badge and sorting by price
        let badgeInfo: (BadgeInfo | null)[] = Object.keys(badgeCounts).map(
            (badgeName) => {
                const badge = badges.find((b) => b.name === badgeName);

                if (badge === undefined) return null;

                return {
                    ...badge,
                    quantity: badgeCounts[badgeName],
                };
            }
        );

        // Removing null values
        badgeInfo = badgeInfo.filter((b) => b !== null);

        return badgeInfo as BadgeInfo[];
    };

    const giftBadge = async (badgeName: string) => {
        // Get the post index on the friend's feed
        const postIndex = friend!.posts.findIndex(
            (p) => p.date === posts[openGiftPrompt!].date
        );

        const response = await fetch(`/api/partner/gift`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user.id,
                partnerId: user.friend,
                badgeName,
                postIndex,
            }),
        });

        if (response.ok) {
            toast.success("Badge gifted!");
            badgeSelected = null;
            openGiftPrompt = null;
            user.points -= badges.find((b) => b.name === badgeName)!.price;
            getFriendData();
        } else {
            toast.error("Failed to gift badge");
        }
    };

    let openReplyPrompt: number | null = null;
    let openGiftPrompt: number | null = null;
    let badgeSelected: string | null = null;

    $: user.badges, (badgeInfo = sortBadges());

    const postReply = async () => {
        // Get the post index on the friend's feed
        const postIndex = friend!.posts.findIndex(
            (p) => p.date === posts[openReplyPrompt!].date
        );

        const content = replyEditor.getContents();

        const response = await fetch(`/api/posts/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user.id,
                partnerId: user.friend,
                postIndex,
                content,
                date: Date.now(),
            }),
        });

        if (response.ok) {
            toast.success("Reply posted!");
            replyEditor.setContents([] as any);
            openReplyPrompt = null;
            getFriendData();
        } else {
            toast.error("Failed to post reply");
        }
    };
</script>

<h2 class="text-4xl sm:text-5xl font-semibold mt-6">Dashboard</h2>
<p class="mt-1.5 sm:mt-3 text-zinc-600">
    Earn points when you post a progress update.
</p>

<div class="flex justify-between gap-10 mt-10 flex-col md:flex-row">
    <section class="grow order-last md:order-none">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg lg:text-2xl text-zinc-900">Your Feed</h2>
        </div>
        <div class="mb-3">
            <TextEditor bind:quill={editor} />
        </div>
        <button
            class="inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 mb-4"
            on:click={postProgressUpdate}
        >
            Post Update
        </button>

        {#if friend === null}
            <p class="text-red-600">
                Warning: You have not been paired with a partner yet
            </p>
        {/if}
        {#each posts as post, index}
            {@const author = user.id === post.userId ? user : friend}
            {#if author !== null}
                <article
                    class="p-6 text-base bg-white rounded-lg {index !== 0 &&
                        'border-t border-zinc-200'}"
                >
                    <footer class="flex justify-between items-center mb-2">
                        <div class="flex items-center">
                            <p
                                class="inline-flex items-center mr-3 text-sm text-zinc-900"
                            >
                                <img
                                    class="mr-2 w-6 h-6 rounded-full"
                                    src={author.image}
                                    alt="{author.firstName}'s Profile"
                                />{author.firstName}
                                {author.lastName}
                            </p>
                            <div class="text-sm text-zinc-600">
                                {new Date(post.date).toLocaleDateString()}
                            </div>
                            <ul class="flex gap-2 ml-4">
                                {#each post.badges as badgeName}
                                    {@const badge = badges.find(
                                        (b) => b.name === badgeName
                                    )}
                                    {#if badge !== undefined}
                                        <li class="text-2xl">
                                            {badge.icon}
                                        </li>
                                    {/if}
                                {/each}
                            </ul>
                        </div>
                        {#if user.id === post.userId}
                            <button
                                class="inline-flex items-center p-2 text-sm font-medium text-center text-zinc-400 bg-white rounded-lg hover:bg-zinc-100 focus:ring-4 focus:outline-none focus:ring-zinc-50"
                            >
                                <svg
                                    class="w-5 h-5"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
                                    />
                                </svg>
                                <span class="sr-only">Comment settings</span>
                            </button>
                        {/if}
                    </footer>
                    <TextEditor content={post.content} />
                    {#if user.id !== post.userId}
                        <div class="flex items-center mt-4 space-x-4 relative">
                            <button
                                class="flex items-center text-sm text-zinc-500 hover:underline"
                                on:click={() => {
                                    if (openReplyPrompt === index) {
                                        openReplyPrompt = null;
                                    } else {
                                        openReplyPrompt = index;
                                        openGiftPrompt = null;
                                    }
                                }}
                            >
                                <svg
                                    aria-hidden="true"
                                    class="mr-1 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    /></svg
                                >
                                Reply
                            </button>

                            {#if openGiftPrompt === index}
                                <div
                                    class="absolute top-8 bg-zinc-50 border border-zinc-200 p-5 z-50"
                                >
                                    <h3 class="text-xl">
                                        Select a Badge to Gift
                                    </h3>
                                    <p class="text-zinc-500 text-sm mb-4">
                                        You have <bold class="font-bold"
                                            >{user.points} Points</bold
                                        >
                                    </p>
                                    <div
                                        class="grid grid-cols-2 lg:grid-cols-4"
                                    >
                                        {#each badges as badge}
                                            {@const canAffordBadge =
                                                user.points >= badge.price}
                                            <button
                                                class="text-sm flex gap-2 {badgeSelected ===
                                                    badge.name &&
                                                    'bg-zinc-100'} p-3 rounded-md {canAffordBadge
                                                    ? 'hover:bg-zinc-100'
                                                    : 'cursor-default'} items-center"
                                                on:click={() => {
                                                    if (canAffordBadge) {
                                                        badgeSelected =
                                                            badge.name;
                                                    }
                                                }}
                                            >
                                                <div class="text-xl mr-1">
                                                    {badge.icon}
                                                </div>

                                                <div>
                                                    <div
                                                        class="hidden md:block"
                                                    >
                                                        {badge.name}
                                                    </div>
                                                    <div
                                                        class="text-xs {!canAffordBadge
                                                            ? 'text-red-500'
                                                            : 'text-zinc-500'}"
                                                    >
                                                        {badge.price} points
                                                    </div>
                                                </div>
                                            </button>
                                        {/each}
                                    </div>
                                    {#if badgeSelected !== null}
                                        <button
                                            class="mt-4 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
                                            on:click={async () => {
                                                if (badgeSelected !== null) {
                                                    await giftBadge(
                                                        badgeSelected
                                                    );
                                                }
                                            }}
                                        >
                                            Gift Badge
                                        </button>
                                    {/if}
                                </div>
                            {/if}
                            <button
                                class="flex items-center text-sm text-zinc-500 hover:underline gap-0.5"
                                on:click={() => {
                                    if (openGiftPrompt === index) {
                                        openGiftPrompt = null;
                                    } else {
                                        openGiftPrompt = index;
                                        openReplyPrompt = null;
                                    }
                                }}
                            >
                                <div class="h-4 w-4 mb-1">
                                    <IoIosGift />
                                </div>
                                Gift Badge
                            </button>
                        </div>
                    {/if}
                </article>

                {#if openReplyPrompt === index}
                    <div
                        class="p-6 ml-6 lg:ml-12 text-base bg-white rounded-lg"
                    >
                        <div class="mb-3">
                            <TextEditor
                                placeholder="Write your reply here..."
                                bind:quill={replyEditor}
                            />
                        </div>
                        <button
                            class="inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 mb-4"
                            on:click={async () => await postReply()}
                        >
                            Post Reply
                        </button>
                    </div>
                {/if}

                {#each post.replies as reply}
                    {@const replyAuthor =
                        user.id === reply.userId ? user : friend}
                    {#if replyAuthor !== null}
                        <article
                            class="p-6 ml-6 lg:ml-12 text-base bg-white rounded-lg"
                        >
                            <footer
                                class="flex justify-between items-center mb-2"
                            >
                                <div class="flex items-center">
                                    <p
                                        class="inline-flex items-center mr-3 text-sm text-zinc-900"
                                    >
                                        <img
                                            class="mr-2 w-6 h-6 rounded-full"
                                            src={replyAuthor.image}
                                            alt="{replyAuthor.firstName}'s Profile"
                                        />{replyAuthor.firstName}
                                        {replyAuthor.lastName}
                                    </p>
                                    <div class="text-sm text-gray-600">
                                        {new Date(
                                            reply.date
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                                {#if user.id === reply.userId}
                                    <button
                                        class="inline-flex items-center p-2 text-sm font-medium text-center text-zinc-400 bg-white rounded-lg hover:bg-zinc-100 focus:ring-4 focus:outline-none focus:ring-zinc-50"
                                    >
                                        <svg
                                            class="w-5 h-5"
                                            aria-hidden="true"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
                                            />
                                        </svg>
                                        <span class="sr-only"
                                            >Comment settings</span
                                        >
                                    </button>
                                {/if}
                            </footer>
                            <TextEditor content={post.content} />
                        </article>
                    {/if}
                {/each}
            {/if}
        {/each}
    </section>
    <section>
        <div
            class="p-5 md:p-8 bg-zinc-50 border border-zinc-200 text-zinc-90 rounded-md"
        >
            <img
                src={user.image}
                alt="{user.firstName}'s Profile"
                class="w-full h-36 md:h-52 rounded-md object-cover"
            />
            <h3 class="text-xl mt-2.5 font-medium">
                {user.firstName}
                {user.lastName}
            </h3>
            <!-- Points and badges display -->
            <div class="flex justify-between my-4">
                <div>
                    <p class="font-medium text-sm">Points</p>
                    <p class="text-lg">{user.points}</p>
                </div>
                <div>
                    <p class="font-medium text-sm">Posts</p>
                    <p class="text-lg">{user.posts.length}</p>
                </div>
            </div>
            <div>
                <p class="font-medium text-sm mb-1">Badges Received</p>
                {#if badgeInfo.length === 0}
                    <p class="text-sm text-zinc-500">
                        You have not received any badges yet
                    </p>
                {:else}
                    <ul class="flex gap-3">
                        {#each badgeInfo as badge}
                            <li class="relative">
                                <div class="text-4xl">{badge.icon}</div>
                                <div
                                    class="absolute bottom-0 right-0 text-[0.6rem] px-1.5 py-0.5 rounded-sm bg-blue-500 text-white"
                                >
                                    {badge.quantity}
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>
    </section>
</div>
