<script lang="ts">
    import { surveyQuestions } from "$lib/surveyQuestions";
    import type { User } from "$lib/types";
    import toast from "svelte-french-toast";

    export let user: User;

    let currentQuestionIndex: number = 0; // TODO: Start at the last unanswered question index
    let currentSelection: string | number = "";

    $: currentQuestionIndex, (currentSelection = answers[currentQuestionIndex]);

    const getSavedAnswers = () => {
        const newList = surveyQuestions.map((question, index) => {
            if (index in user.goals) {
                return user.goals[index];
            } else {
                return "";
            }
        });

        return newList;
    };

    const nextQuestion = async () => {
        answers[currentQuestionIndex] = currentSelection;

        // Getting the indices of all the items that are unanswered (blank strings)
        const indices: number[] = [];
        answers.forEach((item, index) => {
            if (item === "") {
                indices.push(index);
            }
        });

        if (indices.length > 0) {
            // Finding the closest greater index to the current index
            let closestNumber = indices.find(
                (num) => num > currentQuestionIndex
            );

            // If no greater index is found, the lowest index is used
            if (closestNumber === undefined) {
                closestNumber = indices[0];
            }

            currentQuestionIndex = closestNumber;
            return;
        }

        const goals = answers.reduce((acc: User["goals"], answer, index) => {
            acc[index] = answer as number;
            return acc;
        }, {});

        user.goals = goals;

        const userResponse = await fetch(`/api/users/save`, {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
                newData: user,
                headers: {
                    "content-type": "application/json",
                },
            }),
        });

        if (userResponse.ok) {
            toast.success("Results saved successfully");
        } else {
            toast.error("Resutls could not be saved");
        }
    };

    const answers: (number | string)[] = getSavedAnswers();
    $: currentQuestion = surveyQuestions[currentQuestionIndex];
</script>

<div class="flex w-5/6 mx-auto mt-10">
    <ol class="space-y-4">
        {#each surveyQuestions as question, index}
            <li class="w-64">
                <button
                    on:click={() => (currentQuestionIndex = index)}
                    class="w-full p-4 rounded-lg border {answers[index] !== ''
                        ? 'text-green-700 border-green-300 bg-green-50'
                        : 'bg-gray-50 border-gray-200 text-gray-900'} {index ===
                        currentQuestionIndex && 'brightness-105'}"
                >
                    <div class="flex items-center justify-between w-full">
                        <span class="sr-only">{question.shortName}</span>
                        <h3 class="font-medium">
                            {index + 1}. {question.shortName}
                        </h3>
                        {#if answers[index] !== ""}
                            <svg
                                class="w-4 h-4"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 16 12"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M1 5.917 5.724 10.5 15 1.5"
                                />
                            </svg>
                        {/if}
                    </div>
                </button>
            </li>
        {/each}
    </ol>
    <div class="grow px-10 flex flex-col">
        <h2 class="text-4xl text-center mb-10 font-semibold">
            {currentQuestion.prompt}
        </h2>
        <div class="grid grid-cols-3 gap-3">
            {#each currentQuestion.options as option}
                <button
                    class="w-full p-4 rounded-lg border {currentSelection ===
                    option
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-300 text-gray-900'}"
                    on:click={() => {
                        if (currentSelection === option) {
                            currentSelection = "";
                        } else {
                            currentSelection = option;
                        }
                    }}
                >
                    {option}
                </button>
            {/each}
        </div>
        <div class="mt-auto flex justify-center">
            <button
                class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                on:click={nextQuestion}
            >
                Next Question
            </button>
        </div>
    </div>
</div>
