<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { surveyQuestions } from "$lib/data";
    import type { User } from "$lib/types";
    import toast from "svelte-french-toast";

    export let user: User;

    type Selection = "" | number;

    const getSavedAnswers = () => {
        const newList = surveyQuestions.map((question, index) => {
            if (question.shortName in user.goals) {
                return user.goals[index];
            }
            return "";
        });

        return newList;
    };

    const answers: Selection[] = getSavedAnswers();
    let currentQuestionIndex: number = answers.indexOf("");
    let currentSelection: Selection = "";
    let surveySection: 0 | 1 | 2 = 0;

    $: currentQuestionIndex, (currentSelection = answers[currentQuestionIndex]);
    $: currentQuestion = surveyQuestions[currentQuestionIndex];

    let firstNameInput: string = user.firstName || "";
    let lastNameInput: string = user.lastName || "";
    let descriptionInput: string = user.description || "";

    const nextSurveyQuestion = async () => {
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
            const questionShortName = surveyQuestions[index].shortName;

            acc[questionShortName] = answer as number;
            return acc;
        }, {});

        user.goals = goals;
        surveySection = 2;
    };

    const submitSurvey = async () => {
        const userResponse = await fetch(`/api/users/save-survey`, {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
                goals: user.goals,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.description,
                headers: {
                    "content-type": "application/json",
                },
            }),
        });

        if (!userResponse.ok) {
            toast.error("Results could not be saved");
        } else {
            user.surveyCompleted = true;
            user.firstName = firstNameInput;
            user.lastName = lastNameInput;
            user.description = descriptionInput;
        }
    };
</script>

{#if surveySection === 0}
    <div class="absolute inset-0 h-screen w-screen flex flex-col">
        <div class="text-center max-w-screen-md m-auto">
            <h2 class="text-6xl font-semibold mb-4">Questionnaire</h2>
            <p class="text-zinc-600 mb-6">
                We don't know enough yet to match you with your fitness partner.
                Help us learn more about you by completing this questionnaire.
            </p>
            <button
                class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-md px-5 py-2.5"
                on:click={() => (surveySection = 1)}
            >
                Start
            </button>
        </div>
    </div>
{:else if surveySection === 1}
    <div class="flex lg:w-5/6 mx-auto mt-6 sm:mt-10 flex-col sm:flex-row">
        <ol
            class="flex sm:flex-col flex-wrap gap-1.5 sm:gap-4 justify-center sm:justify-star mb-4 sm:mb-0"
        >
            {#each surveyQuestions as question, index}
                <li class="sm:w-48 md:w-64">
                    <button
                        on:click={() => (currentQuestionIndex = index)}
                        class="w-full text-xs sm:text-sm md:text-base px-2 py-1.5 sm:p-4 rounded-lg border {answers[
                            index
                        ] !== ''
                            ? 'text-green-700 border-green-300 bg-green-50'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-900'} {index ===
                            currentQuestionIndex && 'brightness-105'}"
                    >
                        <div
                            class="flex items-center justify-between gap-1 w-full"
                        >
                            <span class="sr-only">{question.shortName}</span>
                            <h3 class="font-medium">
                                <span class="hidden sm:inline"
                                    >{index + 1}.</span
                                >
                                <span>{question.shortName}</span>
                            </h3>
                            {#if answers[index] !== ""}
                                <svg
                                    class="w-3 h-3 sm:w-4 sm:h-4"
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
            <h2
                class="text-[1.6rem] md:text-3xl lg:text-4xl text-center mb-5 sm:mb-10 font-semibold"
            >
                {currentQuestion.prompt}
            </h2>
            <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {#each currentQuestion.options as option, index}
                    <button
                        class="w-full p-4 text-sm lg:text-base rounded-lg border {currentSelection ===
                        index
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'bg-white border-zinc-300 text-zinc-900'}"
                        on:click={() => {
                            if (currentSelection === index) {
                                currentSelection = "";
                            } else {
                                currentSelection = index;
                            }
                        }}
                    >
                        {option}
                    </button>
                {/each}
            </div>
            <div class="mt-auto flex justify-center pt-4">
                <button
                    class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                    on:click={nextSurveyQuestion}
                >
                    Next Question
                </button>
            </div>
        </div>
    </div>
{:else if surveySection === 2}
    <div class="max-w-screen-md mx-auto">
        <h2 class="text-5xl text-center">Additional Information</h2>
        <p class="text-red-600 mt-10 mb-3">
            Disclaimer: This information will be available to other users who
            you are matched with.
        </p>
        <div class="flex gap-3 mb-3">
            <div class="w-full">
                <label
                    for="default-input"
                    class="block mb-2 text-sm font-medium text-gray-900"
                >
                    First Name
                </label>
                <input
                    type="text"
                    id="default-input"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none"
                    bind:value={firstNameInput}
                />
            </div>
            <div class="w-full">
                <label
                    for="default-input"
                    class="block mb-2 text-sm font-medium text-gray-900"
                >
                    Last Name
                </label>
                <input
                    type="text"
                    id="default-input"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none"
                    bind:value={lastNameInput}
                />
            </div>
        </div>

        <label
            for="message"
            class="block mb-2 text-sm font-medium text-gray-900"
        >
            Description
        </label>
        <textarea
            id="message"
            rows="4"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 outline-none"
            placeholder="Write your thoughts here..."
            bind:value={descriptionInput}
        />

        <button
            class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-md px-5 py-2.5 mt-6"
            on:click={submitSurvey}
        >
            Finish
        </button>
    </div>
{/if}
