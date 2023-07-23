<script lang="ts">
    import type Quill from "quill";
    import { onMount } from "svelte";

    let editor: HTMLElement;

    export let toolbarOptions = [
        [{ header: 1 }, { header: 2 }, "blockquote", "link", "image", "video"],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "ordered" }],
        [{ align: [] }],
    ];

    export let quill: Quill | null = null;
    export let content: any = null;

    onMount(async () => {
        const { default: Quill } = await import("quill");

        quill = new Quill(editor, {
            modules: {
                toolbar: content !== null ? false : toolbarOptions,
            },
            theme: "snow",
            placeholder: "Write about your workout or progress here...",
            readOnly: content !== null,
        });

        if (content !== null) {
            quill.setContents(content);
        }
    });
</script>

<div class={content !== null ? "readonly" : ""}>
    <div bind:this={editor} />
</div>

<style>
    @import "https://cdn.quilljs.com/1.3.6/quill.snow.css";

    :global(.ql-editor) {
        font-family: "Poppins", sans-serif;
        font-size: larger;
    }

    :global(.readonly .ql-container.ql-snow) {
        border: none;
    }
</style>
