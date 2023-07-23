<script lang="ts">
    import { onMount } from "svelte";
    import type { Post, User, Friend } from "$lib/types";
    import toast from "svelte-french-toast";
    import TextEditor from "./TextEditor.svelte";
    import type Quill from "quill";

    export let user: User;

    let friend: Friend;

    onMount(async () => {
        if (user.friend) return;

        const res = await fetch(`/api/users/find-match?userId=${user.id}`);
        const data = await res.json();

        if (res.ok) {
            user.friend = data.match;
            toast.success("You have a new friend!");
        } else {
            toast.error(
                "Sorry, no matches were found. Come back another time."
            );
        }

        // Getting the friend's data
        // const friendRes = await fetch(
        //     `/api/partner/get-data?userId=${user.friend}`
        // );
        // const friendData = await friendRes.json();

        // if (friendRes.ok) {
        //     friend = friendData;
        // } else {
        //     toast.error(
        //         "Failed to get your friend's data. Please try again later."
        //     );
        // }
    });

    let editor: Quill;

    const postProgressUpdate = async () => {
        const content = editor.getContents();

        const post: Post = {
            userId: user.id,
            content,
            date: Date.now(),
            replies: [],
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
            user.posts.push(post);
            user = user;
            toast.success("Post created!");
        }
    };
</script>

<h2 class="text-5xl">Dashboard</h2>

<section>
    <h2 class="text-2xl">Your Badges</h2>
</section>

<div class="flex justify-between gap-10">
    <section class="bg-white py-8 lg:py-16 grow">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg lg:text-2xl text-gray-900">Progress Reports</h2>
        </div>
        <div class="mb-3">
            <TextEditor bind:quill={editor} />
        </div>
        <button
            class="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
            on:click={postProgressUpdate}
        >
            Post Update
        </button>

        {#each user.posts as post, index}
            <article
                class="p-6 mb-6 text-base bg-white rounded-lg {index !== 0 &&
                    'border-t border-gray-200'}"
            >
                <footer class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        <p
                            class="inline-flex items-center mr-3 text-sm text-gray-900"
                        >
                            <img
                                class="mr-2 w-6 h-6 rounded-full"
                                src={user.image}
                                alt="{user.firstName}'s Profile"
                            />{user.firstName}
                            {user.lastName}
                        </p>
                        <div class="text-sm text-gray-600">
                            {new Date(post.date).toLocaleDateString()}
                        </div>
                    </div>
                    <button
                        id="dropdownComment1Button"
                        data-dropdown-toggle="dropdownComment1"
                        class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-400 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
                        type="button"
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
                    <!-- Dropdown menu -->
                    <div
                        id="dropdownComment1"
                        class="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow"
                    >
                        <ul
                            class="py-1 text-sm text-gray-700"
                            aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                            <li>
                                <a
                                    href="#"
                                    class="block py-2 px-4 hover:bg-gray-100"
                                    >Edit</a
                                >
                            </li>
                            <li>
                                <a
                                    href="#"
                                    class="block py-2 px-4 hover:bg-gray-100"
                                    >Remove</a
                                >
                            </li>
                            <li>
                                <a
                                    href="#"
                                    class="block py-2 px-4 hover:bg-gray-100"
                                    >Report</a
                                >
                            </li>
                        </ul>
                    </div>
                </footer>
                <TextEditor content={post.content} />
                <div class="flex items-center mt-4 space-x-4">
                    <button
                        type="button"
                        class="flex items-center text-sm text-gray-500 hover:underline"
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
                </div>
            </article>
        {/each}
    </section>
    <section class="p-4">
        <img src={user.image} alt="{user.firstName}'s Profile" />
    </section>
</div>
