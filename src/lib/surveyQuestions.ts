interface Question {
    shortName: string;
    prompt: string;
    options: string[];
}

// TODO: Add actual questions
export const surveyQuestions: Question[] = [
    {
        shortName: "Goals",
        prompt: "What is your primary fitness goal?",
        options: [
            "Lose weight",
            "Build muscle",
            "Improve cardiovascular health",
            "Increase flexibility",
            "General fitness and well-being",
        ],
    },
    {
        shortName: "Time",
        prompt: "How often do you currently exercise?",
        options: [
            "Never",
            "Rarely (1-2 times a month)",
            "Occasionally (1-2 times a week)",
            "Regularly (3-4 times a week)",
            "Very frequently (5 or more times a week)",
        ],
    },
    {
        shortName: "Interests",
        prompt: "What type of exercise are you interested in?",
        options: [
            "Strength training",
            "Cardiovascular exercises",
            "Yoga/Pilates",
            "Group fitness classes",
            "Sports and outdoor activities",
        ],
    },
    {
        shortName: "Restrictions",
        prompt: "Do you have any specific dietary preferences or restrictions?",
        options: [
            "Vegetarian",
            "Vegan",
            "Gluten-free",
            "Dairy-free",
            "No specific preferences or restrictions",
        ],
    },
    {
        shortName: "Current Level",
        prompt: "How would you rate your current fitness level?",
        options: [
            "Sedentary (little to no physical activity)",
            "Beginner (limited exercise experience)",
            "Intermediate (moderate exercise experience)",
            "Advanced (regular exercise routine)",
            "Athlete (highly active and experienced)",
        ],
    },
    {
        shortName: "Availability",
        prompt: "What time of day do you prefer to exercise?",
        options: ["Morning", "Afternoon", "Evening", "Anytime"],
    },
];
