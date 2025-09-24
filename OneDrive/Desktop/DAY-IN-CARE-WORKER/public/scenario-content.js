// Detailed content for trial scenarios
const scenarioContent = {
    1: {
        title: "Medication Refusal",
        situation: "Mrs. Johnson, 78, is refusing to take her morning medication. She's become agitated and is saying 'I don't need those pills, they make me feel sick!'",

        steps: [
            {
                step: 1,
                title: "Initial Assessment",
                content: "Before approaching Mrs. Johnson, take a moment to assess the situation:",
                points: [
                    "Observe her body language and emotional state",
                    "Check if there are any obvious reasons for distress",
                    "Ensure the environment is calm and not overstimulating",
                    "Review her medication schedule and any recent changes"
                ],
                tips: "Never force medication. Your safety and the client's dignity come first."
            },
            {
                step: 2,
                title: "Professional Approach",
                content: "Use these communication techniques:",
                points: [
                    "Approach calmly with open body language",
                    "Sit at her eye level if possible",
                    "Use a gentle, respectful tone",
                    "Listen to her concerns without interrupting"
                ],
                dialogue: {
                    good: "Mrs. Johnson, I can see you're upset about the medication. Can you tell me what's worrying you?",
                    bad: "Mrs. Johnson, you need to take your pills right now. Doctor's orders."
                }
            },
            {
                step: 3,
                title: "Understanding Concerns",
                content: "Common reasons for medication refusal and responses:",
                scenarios: [
                    {
                        concern: "\"They make me feel sick\"",
                        response: "I understand. Let's talk about when you feel sick - is it right after taking them or later? We can discuss this with your doctor."
                    },
                    {
                        concern: "\"I don't need them\"",
                        response: "I hear you. Can you help me understand why you feel you don't need them today?"
                    },
                    {
                        concern: "\"I'm not sick\"",
                        response: "You're right, you're managing well. These medicines help keep you feeling this good."
                    }
                ]
            },
            {
                step: 4,
                title: "Problem-Solving Together",
                content: "Collaborative approaches to try:",
                options: [
                    "Offer medication with preferred food or drink",
                    "Explain simply what each medication does",
                    "Allow choice in timing (within safe limits)",
                    "Break down into smaller, manageable steps",
                    "Use visual aids or pill organizers"
                ]
            },
            {
                step: 5,
                title: "Documentation & Follow-up",
                content: "Essential steps after the interaction:",
                requirements: [
                    "Document the refusal and reasons given",
                    "Record any successful strategies used",
                    "Note any concerning symptoms or changes",
                    "Inform supervisor and healthcare team",
                    "Plan alternative approaches for next time"
                ]
            }
        ],

        keyLearning: [
            "Respect client autonomy while ensuring safety",
            "Active listening builds trust and cooperation",
            "Understanding underlying concerns is crucial",
            "Documentation protects both client and carer",
            "Team communication ensures continuity of care"
        ],

        redFlags: [
            "Never force medication",
            "Don't hide medication in food without consent",
            "Don't argue or become confrontational",
            "Never leave medication unattended",
            "Don't skip documentation"
        ]
    },

    2: {
        title: "Bathroom Fall Emergency",
        situation: "You hear a loud thud from Mr. Williams' bathroom. When you check, you find him sitting on the floor next to the toilet, looking dazed and holding his arm.",

        steps: [
            {
                step: 1,
                title: "Immediate Safety Assessment",
                content: "First priority - ensure scene safety and client stability:",
                points: [
                    "Don't rush in - assess the scene for hazards",
                    "Check if Mr. Williams is conscious and responsive",
                    "Look for obvious injuries or bleeding",
                    "Ensure he's not in immediate danger (water, sharp objects)"
                ],
                critical: "DO NOT move him immediately - he may have serious injuries"
            },
            {
                step: 2,
                title: "Primary Assessment (ABC)",
                content: "Follow the ABC protocol:",
                protocol: {
                    A: "Airway - Is he breathing clearly? Any obstruction?",
                    B: "Breathing - Is he breathing normally? Any difficulty?",
                    C: "Circulation - Check pulse, look for severe bleeding"
                },
                questions: [
                    "Mr. Williams, can you hear me?",
                    "Can you tell me your name?",
                    "Do you remember what happened?",
                    "Where does it hurt?"
                ]
            },
            {
                step: 3,
                title: "Injury Assessment",
                content: "Systematic check for injuries:",
                bodyAreas: [
                    {
                        area: "Head/Neck",
                        signs: "Cuts, bumps, neck pain, confusion, nausea",
                        action: "If suspected head/neck injury - DO NOT MOVE"
                    },
                    {
                        area: "Arms/Shoulders",
                        signs: "Deformity, swelling, inability to move",
                        action: "Support injured arm, don't force movement"
                    },
                    {
                        area: "Back/Spine",
                        signs: "Back pain, tingling in limbs",
                        action: "Keep still, support in position found"
                    },
                    {
                        area: "Hips/Legs",
                        signs: "Hip pain, leg deformity, inability to bear weight",
                        action: "Suspect fracture - immobilize"
                    }
                ]
            },
            {
                step: 4,
                title: "Emergency Response Decision",
                content: "When to call emergency services:",
                call999: [
                    "Unconscious or altered consciousness",
                    "Suspected head, neck, or spinal injury",
                    "Obvious fractures or deformities",
                    "Severe bleeding",
                    "Difficulty breathing",
                    "Chest pain",
                    "Unable to move or bear weight"
                ],
                monitoring: [
                    "Keep talking to maintain consciousness",
                    "Monitor breathing and pulse",
                    "Cover with blanket to prevent shock",
                    "Don't give food or water",
                    "Stay with them until help arrives"
                ]
            },
            {
                step: 5,
                title: "Safe Movement (If Appropriate)",
                content: "Only if no serious injury suspected:",
                technique: [
                    "Get help from another staff member",
                    "Use proper lifting techniques",
                    "Support at strongest points (under arms, around waist)",
                    "Move slowly and smoothly",
                    "Stop immediately if pain increases"
                ],
                equipment: "Use lifting aids if available (sliding sheets, hoists)"
            },
            {
                step: 6,
                title: "Post-Incident Care",
                content: "Essential follow-up steps:",
                immediate: [
                    "Complete incident report immediately",
                    "Notify family and healthcare team",
                    "Monitor for delayed symptoms (24-48 hours)",
                    "Review and improve bathroom safety"
                ],
                prevention: [
                    "Install grab rails if needed",
                    "Ensure adequate lighting",
                    "Remove slip hazards",
                    "Consider mobility aids",
                    "Review medication side effects"
                ]
            }
        ],

        keyLearning: [
            "Scene safety comes first - protect yourself and client",
            "Systematic assessment prevents missing injuries",
            "When in doubt, call emergency services",
            "Proper documentation is legally essential",
            "Prevention strategies reduce future incidents"
        ],

        redFlags: [
            "Never move someone with suspected spinal injury",
            "Don't leave an injured person alone",
            "Don't give pain medication without medical approval",
            "Don't minimize or ignore 'minor' falls",
            "Never skip incident reporting"
        ]
    }
};