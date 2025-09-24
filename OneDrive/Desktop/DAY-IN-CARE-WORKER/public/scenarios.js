// Care Worker Training Scenarios
const trainingScenarios = [
    {
        id: 1,
        title: "Medication Refusal",
        description: "Client refuses to take prescribed medication. Learn de-escalation techniques and proper protocols.",
        difficulty: "Beginner",
        duration: "15 mins",
        category: "Medication Management",
        isTrial: true
    },
    {
        id: 2,
        title: "Bathroom Fall Emergency",
        description: "Client has fallen in the bathroom. Practice emergency response and injury assessment.",
        difficulty: "Beginner",
        duration: "20 mins",
        category: "Emergency Response",
        isTrial: true
    },
    {
        id: 3,
        title: "Aggressive Behavior Management",
        description: "Handle aggressive client behavior safely and professionally.",
        difficulty: "Intermediate",
        duration: "25 mins",
        category: "Behavioral Management"
    },
    {
        id: 4,
        title: "Dementia Communication",
        description: "Effective communication strategies for clients with dementia.",
        difficulty: "Intermediate",
        duration: "30 mins",
        category: "Dementia Care"
    },
    {
        id: 5,
        title: "End of Life Care",
        description: "Providing compassionate care during end-of-life situations.",
        difficulty: "Advanced",
        duration: "35 mins",
        category: "Palliative Care"
    },
    {
        id: 6,
        title: "Food Choking Incident",
        description: "Client is choking during mealtime. Emergency response training.",
        difficulty: "Intermediate",
        duration: "20 mins",
        category: "Emergency Response"
    },
    {
        id: 7,
        title: "Infection Control Protocols",
        description: "Proper infection control procedures and PPE usage.",
        difficulty: "Beginner",
        duration: "25 mins",
        category: "Health & Safety"
    },
    {
        id: 8,
        title: "Mobility Assistance",
        description: "Safe techniques for helping clients with mobility issues.",
        difficulty: "Beginner",
        duration: "20 mins",
        category: "Physical Care"
    },
    {
        id: 9,
        title: "Mental Health Crisis",
        description: "Supporting clients experiencing mental health emergencies.",
        difficulty: "Advanced",
        duration: "40 mins",
        category: "Mental Health"
    },
    {
        id: 10,
        title: "Wound Care Management",
        description: "Proper wound cleaning, dressing, and monitoring techniques.",
        difficulty: "Intermediate",
        duration: "30 mins",
        category: "Medical Care"
    },
    {
        id: 11,
        title: "Fire Emergency Evacuation",
        description: "Fire safety protocols and evacuation procedures.",
        difficulty: "Intermediate",
        duration: "25 mins",
        category: "Emergency Response"
    },
    {
        id: 12,
        title: "Diabetes Management",
        description: "Supporting clients with diabetes - monitoring and emergency response.",
        difficulty: "Intermediate",
        duration: "35 mins",
        category: "Medical Care"
    },
    {
        id: 13,
        title: "Family Conflict Resolution",
        description: "Managing conflicts between clients and family members.",
        difficulty: "Advanced",
        duration: "30 mins",
        category: "Communication"
    },
    {
        id: 14,
        title: "Personal Hygiene Assistance",
        description: "Respectful assistance with personal care and hygiene.",
        difficulty: "Beginner",
        duration: "20 mins",
        category: "Personal Care"
    },
    {
        id: 15,
        title: "Stroke Recognition",
        description: "Identifying stroke symptoms and emergency response protocols.",
        difficulty: "Advanced",
        duration: "25 mins",
        category: "Emergency Response"
    },
    {
        id: 16,
        title: "Nutrition and Feeding",
        description: "Proper nutrition care and feeding assistance techniques.",
        difficulty: "Beginner",
        duration: "25 mins",
        category: "Nutrition"
    },
    {
        id: 17,
        title: "Depression Support",
        description: "Recognizing and supporting clients with depression.",
        difficulty: "Intermediate",
        duration: "30 mins",
        category: "Mental Health"
    },
    {
        id: 18,
        title: "Pressure Sore Prevention",
        description: "Prevention and early detection of pressure sores.",
        difficulty: "Intermediate",
        duration: "25 mins",
        category: "Medical Care"
    },
    {
        id: 19,
        title: "Documentation and Reporting",
        description: "Proper documentation practices and incident reporting.",
        difficulty: "Beginner",
        duration: "20 mins",
        category: "Administration"
    },
    {
        id: 20,
        title: "Cultural Sensitivity",
        description: "Providing culturally appropriate care and communication.",
        difficulty: "Intermediate",
        duration: "30 mins",
        category: "Cultural Care"
    },
    {
        id: 21,
        title: "Safeguarding Adults",
        description: "Recognizing and reporting signs of abuse or neglect.",
        difficulty: "Advanced",
        duration: "40 mins",
        category: "Safeguarding"
    },
    {
        id: 22,
        title: "Professional Boundaries",
        description: "Maintaining appropriate professional relationships with clients.",
        difficulty: "Intermediate",
        duration: "25 mins",
        category: "Professional Development"
    }
];

// License status (this would normally come from your backend)
let licenseStatus = {
    isTrialMode: true,
    scenariosUnlocked: 2,
    totalScenarios: 22
};