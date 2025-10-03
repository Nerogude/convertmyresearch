const db = require('./db');

async function seedScenarioContent() {
  try {
    console.log('Seeding scenario content...');

    // Get scenario IDs
    const scenarios = await db.query('SELECT id, title FROM scenarios ORDER BY id');

    if (scenarios.rows.length < 2) {
      console.error('Scenarios not found. Run database initialization first.');
      return;
    }

    const sundowningId = scenarios.rows[0].id;
    const fallId = scenarios.rows[1].id;

    // Clear existing nodes and choices
    await db.query('DELETE FROM scenario_choices');
    await db.query('DELETE FROM scenario_nodes');

    console.log('Creating "The Sundowning Wanderer" scenario nodes...');
    await seedSundowningWanderer(sundowningId);

    console.log('Creating "The Fall in the Bathroom" scenario nodes...');
    await seedFallInBathroom(fallId);

    console.log('✓ Scenario content seeded successfully');
  } catch (error) {
    console.error('Error seeding scenario content:', error);
    throw error;
  }
}

async function seedSundowningWanderer(scenarioId) {
  // START NODE
  const startNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'start',
      `It's 6:30 PM, and you're finishing up your evening rounds in the residential care home. As you walk past the main lounge, you notice Margaret Thompson, 78, standing by the locked front door, pulling at the handle. Her face is flushed, and she's becoming increasingly distressed.

"I need to go home!" she says urgently. "My husband will be worried. He'll be home from work soon, and I need to get dinner ready."

You know from her care plan that Margaret's husband passed away five years ago, and she has moderate to severe Alzheimer's Disease. This is classic sundowning behavior - she often becomes confused and agitated in the late afternoon.`,
      'How do you respond to Margaret?',
      false,
      0,
      0,
    ]
  );

  // Choice 1: Re-orientation (Suboptimal)
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      '"Margaret, you live here now, remember? Your husband passed away. You don\'t need to go home."',
      'reorientation_response',
      false,
      false,
      'Re-orientation can be distressing for people with dementia. Directly confronting them with painful facts (like the death of a spouse) often increases agitation rather than providing clarity.',
    ]
  );

  // Choice 2: Validation (Best Practice)
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      '"You must be worried about him. Tell me about your husband - what\'s his name?"',
      'validation_response',
      true,
      false,
      'Excellent choice. Validation therapy acknowledges the person\'s feelings without correcting their reality. This builds trust and can help de-escalate distress.',
    ]
  );

  // Choice 3: Distraction (Valid Alternative)
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      '"It\'s getting cold outside. How about we have a cup of tea first before you go?"',
      'distraction_response',
      false,
      true,
      'Distraction can work, but it\'s more effective when combined with validation. You\'ve avoided confrontation, which is good, but haven\'t fully acknowledged her emotional state.',
    ]
  );

  // REORIENTATION PATH (Suboptimal outcome)
  const reorientNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'reorientation_response',
      `Margaret's face crumples. "He's... he's dead?" Tears well up in her eyes. "No, no, that can't be right. I just saw him this morning!"

She becomes more agitated, pulling harder at the door handle. "Let me out! I need to go home!"

Other residents in the lounge are starting to notice the commotion. Margaret is now crying and raising her voice.`,
      'What do you do now?',
      false,
      -15,
      -10,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      reorientNode.rows[0].id,
      'Call for help from a colleague and try to move Margaret to a quieter space',
      'reorientation_ending',
      true,
      false,
      'Good recovery. Recognizing when you need support and removing the person from a triggering environment are important de-escalation strategies.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      reorientNode.rows[0].id,
      'Firmly but calmly explain again that she lives here and cannot leave',
      'reorientation_bad_ending',
      false,
      false,
      'Repeating the same approach that caused distress is unlikely to help. Persistence in re-orientation often makes sundowning behavior worse.',
    ]
  );

  // Reorientation Ending (Recovered)
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'reorientation_ending',
      `You signal to Sarah, a senior carer, who comes over to assist. Together, you gently guide Margaret away from the door toward the quiet room.

"Come on, Margaret, let's sit down for a moment," Sarah says warmly.

With gentle redirection and a calm environment, Margaret gradually settles. After 20 minutes, she's calmer, though still subdued. You've documented the incident and noted that re-orientation triggered significant distress.

The situation is resolved, but it took longer than necessary and caused Margaret considerable emotional pain. You reflect on how validation or redirection might have been less distressing approaches.`,
      null,
      true,
      -5,
      -5,
    ]
  );

  // Reorientation Bad Ending
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'reorientation_bad_ending',
      `Margaret becomes increasingly distressed and begins shouting. She tries to push past you, and you have to physically block the door. Other residents are now visibly upset by the commotion.

A manager intervenes and takes over, using gentle validation and redirection to gradually calm Margaret down. The episode lasts nearly 45 minutes.

Later, the manager discusses the incident with you, explaining why re-orientation is generally not recommended for people with advanced dementia, especially during sundowning. Margaret is exhausted and withdrawn for the rest of the evening.

This was a difficult learning experience about the importance of person-centered dementia care approaches.`,
      null,
      true,
      -20,
      -20,
    ]
  );

  // VALIDATION PATH (Best Practice)
  const validationNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'validation_response',
      `Margaret's face softens slightly. "His name is Robert," she says, her voice steadier now. "We've been married 40 years. He works at the postal depot."

You can see she's engaging with you, though still focused on leaving. She glances toward the door again but isn't pulling at it anymore.

"He's a good man," she continues. "Always home by six. I need to get the roast in the oven."`,
      'How do you continue?',
      false,
      5,
      5,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      validationNode.rows[0].id,
      '"He sounds wonderful. You must make lovely dinners together. What\'s his favorite meal?"',
      'validation_best_ending',
      true,
      false,
      'Perfect continuation of validation. You\'re building rapport and allowing her to talk about meaningful memories, which reduces anxiety.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      validationNode.rows[0].id,
      '"The kitchen staff have already prepared dinner here. Shall we go and see what they\'ve made?"',
      'validation_redirect_ending',
      false,
      true,
      'This combines validation with gentle redirection, which can work well. It\'s not wrong, but continuing to validate her feelings first might create an even stronger connection.',
    ]
  );

  // Validation Best Ending
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'validation_best_ending',
      `Margaret's entire demeanor changes. She smiles, her eyes distant but warm with memory.

"Oh, he loves my shepherd's pie," she says, her hand relaxing on the door handle. "And apple crumble with custard for pudding."

You spend a few minutes chatting with her about cooking, about Robert, about their life together. Gradually, you guide her away from the door toward the lounge seating area.

"You know, Margaret, it's getting rather cold outside now. How about we sit by the fire for a bit? I'd love to hear more about Robert."

She follows you willingly. Within ten minutes, she's settled in her favorite chair, calm and content, looking through a photo album. She's completely forgotten about leaving.

You've successfully de-escalated the situation using validation and person-centered communication. Margaret feels heard, respected, and safe.`,
      null,
      true,
      15,
      10,
    ]
  );

  // Validation with Redirect Ending
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'validation_redirect_ending',
      `"Oh... the kitchen staff?" Margaret looks uncertain, but she's no longer trying to leave.

"Yes, let's go and see," you say, gently guiding her toward the dining room.

The familiar smell of dinner and the warm, well-lit environment help ground her. You sit with her for a few minutes, and she gradually becomes more present, eventually eating her meal without further distress about leaving.

The crisis has passed. Your combination of validation and gentle redirection worked well, though the transition was a bit abrupt. Margaret is calm now, though not quite as content as she might have been with fuller emotional validation.`,
      null,
      true,
      10,
      5,
    ]
  );

  // DISTRACTION PATH
  const distractNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'distraction_response',
      `Margaret pauses, looking at you uncertainly. "Tea? But I need to..."

She trails off, still tense but no longer pulling at the door. The distraction has worked partially - you've interrupted the behavior - but she still looks anxious and unsettled.

"I suppose... just a quick one," she says hesitantly.`,
      'What do you do while making tea?',
      false,
      0,
      0,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      distractNode.rows[0].id,
      'Engage her in conversation about her husband and her feelings about going home',
      'distraction_good_ending',
      true,
      false,
      'Excellent. You\'re now adding validation to the distraction, which creates a more person-centered approach.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      distractNode.rows[0].id,
      'Keep her distracted by talking about the weather, other residents, and general small talk',
      'distraction_ok_ending',
      false,
      true,
      'This maintains the distraction but doesn\'t address the underlying emotional need. It works in the short term but may not be as satisfying for Margaret.',
    ]
  );

  // Distraction Good Ending
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'distraction_good_ending',
      `As you make the tea, you ask Margaret about Robert and what she was planning to cook for dinner.

Her face brightens. "Oh, Robert loves my cooking," she says, settling into a chair. "He's such a good man..."

By combining the distraction with validation, you've created a safe space for her to express her feelings. Over the next 15 minutes, she gradually relaxes, enjoys her tea, and forgets about leaving.

The approach worked well - you successfully redirected her while honoring her emotional reality.`,
      null,
      true,
      10,
      8,
    ]
  );

  // Distraction OK Ending
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'distraction_ok_ending',
      `You keep Margaret occupied with light conversation as you make tea. She sips it quietly, still looking a bit anxious and unsettled.

The immediate crisis is over - she's no longer trying to leave - but she remains withdrawn and preoccupied. After finishing her tea, she wanders off to her room, looking subdued.

The distraction worked to stop the behavior, but didn't really address her emotional needs. She's safe, but not particularly content.`,
      null,
      true,
      5,
      0,
    ]
  );
}

async function seedFallInBathroom(scenarioId) {
  // START NODE
  const startNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'start',
      `You're on your morning round of home visits. Your next client is Arthur Davies, 82, who receives twice-daily care visits. When you arrive at his home and let yourself in with the key safe code, you call out: "Arthur! It's the carer - I'm here for your morning visit!"

No response.

You call again. Still nothing.

Following protocol, you check the house. In the bathroom, you find Arthur on the floor between the toilet and the sink. He's conscious, lying on his left side. There's blood on the side of his head, and his left wrist is at an odd angle. His walking frame is knocked over nearby.

"Oh, thank goodness," Arthur says weakly. "I'm alright, dear. Just a silly fall. Help me up, will you?"`,
      'What is your immediate action?',
      false,
      0,
      0,
    ]
  );

  // Choice 1: Help him up immediately (WRONG)
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      'Help Arthur up off the floor as he\'s requested',
      'immediate_assist_bad',
      false,
      false,
      'This is dangerous. Moving someone after a fall, especially when there\'s a head injury and possible fracture, can cause serious harm. You must assess first.',
    ]
  );

  // Choice 2: Assess before acting (BEST PRACTICE)
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      '"I need to check you\'re okay before we move you, Arthur. Can you tell me what happened?"',
      'proper_assessment',
      true,
      false,
      'Excellent. You\'re following DRSABCD protocol - assessing before acting is critical in first aid situations.',
    ]
  );

  // Choice 3: Call 999 immediately without assessment
  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      startNode.rows[0].id,
      'Immediately call 999 before doing anything else',
      'premature_999',
      false,
      true,
      'While calling for help might be necessary, you should do a rapid assessment first to give emergency services accurate information.',
    ]
  );

  // IMMEDIATE ASSIST PATH (BAD)
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'immediate_assist_bad',
      `You help Arthur to sit up and then attempt to get him to his feet. He cries out in pain as his left arm moves.

"Ahh! My wrist!"

As you lift him, he becomes dizzy and nearly faints. You have to support his full weight to prevent him falling again. You manage to get him into his chair, but he's now very pale and confused.

You realize you may have made his injuries worse by moving him without proper assessment. His wrist is clearly fractured and may now have additional damage. Your manager later explains this was a serious breach of protocol.

Arthur requires hospitalization. You must file an incident report.`,
      null,
      true,
      -25,
      -15,
    ]
  );

  // PROPER ASSESSMENT PATH
  const assessNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'proper_assessment',
      `"I tripped on the bath mat," Arthur explains. "Hit my head on the sink on the way down. Landed on my hand."

You kneel beside him and conduct a rapid assessment:
- He's conscious and able to speak clearly
- Breathing normally
- Small laceration on his temple, bleeding has mostly stopped
- Left wrist is swollen and he can't move it without pain
- He's been on the floor for approximately 45 minutes (he fell after his usual morning tea time)
- His legs seem uninjured and he can move them

"I just want to get up," Arthur insists. "I'm fine, just help me up."

But you can see he has a likely fractured wrist and a head injury.`,
      'What is your next action?',
      false,
      5,
      0,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      assessNode.rows[0].id,
      'Call 999 and explain the situation, keeping Arthur still and comfortable until help arrives',
      'call_999_correct',
      true,
      false,
      'Perfect. Head injury plus suspected fracture requires emergency medical assessment. Keeping him still is the right choice.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      assessNode.rows[0].id,
      'Agree to help him up since his legs seem fine, but support his injured arm carefully',
      'partial_compliance',
      false,
      false,
      'This is risky. Even if his legs are uninjured, the head injury means he could become dizzy. You shouldn\'t move him without medical clearance.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      assessNode.rows[0].id,
      'Call your office for advice on whether to call 999 or handle it yourself',
      'call_office',
      false,
      true,
      'While seeking advice isn\'t wrong, the assessment clearly indicates 999 is needed. Delaying the call wastes valuable time.',
    ]
  );

  // CALL 999 CORRECT PATH
  const call999Node = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'call_999_correct',
      `You calmly explain to Arthur: "You've had a nasty fall with a head injury and your wrist looks broken. I need to call an ambulance to make sure you're properly checked over. I'm going to keep you comfortable here until they arrive."

Arthur protests: "Oh, don't be daft! I don't need an ambulance for this!"

You maintain your professional judgment and dial 999.

When connected, you provide clear information:
"Ambulance please. I'm a care worker attending a service user who's had a fall. 82-year-old male, found on bathroom floor, been down approximately 45 minutes. Conscious and alert. Head laceration with dried blood, suspected fractured left wrist, possible concussion. Patient is on warfarin and has a history of osteoporosis."

The dispatcher confirms an ambulance is on the way.`,
      'While waiting for the ambulance, what do you do?',
      false,
      10,
      5,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      call999Node.rows[0].id,
      'Keep Arthur still and comfortable, monitor his condition, fetch his medication list and hospital bag',
      'best_ending',
      true,
      false,
      'Excellent. You\'re providing ongoing care, monitoring for deterioration, and preparing the information paramedics will need.',
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      call999Node.rows[0].id,
      'Try to make him more comfortable by helping him sit up against the wall',
      'move_during_wait',
      false,
      false,
      'You should not move him. He\'s as comfortable as possible lying down, and moving him could worsen injuries or cause him to faint.',
    ]
  );

  // BEST ENDING
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'best_ending',
      `You fetch a pillow to support Arthur's head and a blanket to keep him warm. You locate his medication list from the kitchen and pack his hospital bag with essentials.

While waiting, you continuously monitor him:
- Checking he remains conscious and alert
- Watching for any changes in his condition
- Reassuring him calmly

You also notify your office of the situation and complete a safeguarding alert (due to his high falls risk).

The ambulance arrives within 12 minutes. You provide the paramedics with a comprehensive handover:
- Full description of how you found him
- Your assessment findings
- His medical history and medications
- His care plan and next of kin details

The paramedics commend you on your thorough assessment and appropriate response.

Arthur is diagnosed with a fractured wrist and mild concussion at hospital. Thanks to your quick, correct actions and good information sharing, he receives prompt treatment and makes a full recovery.

This is an excellent example of following protocol in an emergency situation.`,
      null,
      true,
      20,
      10,
    ]
  );

  // MOVE DURING WAIT
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'move_during_wait',
      `You help Arthur to a sitting position against the bathroom wall. As he sits up, he becomes very pale and dizzy.

"I don't feel well," he says, and begins to slump sideways.

You have to support him to prevent another fall. When the paramedics arrive, they immediately lay him back down and check for additional injuries.

One paramedic quietly asks you why you moved him. You explain you were trying to make him comfortable, but you can see from their expression this was the wrong decision.

Arthur is taken to hospital where he's diagnosed with a fractured wrist and concussion. Your manager later reviews the incident with you, reminding you not to move patients after a fall unless there's immediate danger.

The outcome was acceptable, but you created unnecessary risk by moving him.`,
      null,
      true,
      5,
      -5,
    ]
  );

  // PARTIAL COMPLIANCE PATH
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'partial_compliance',
      `Against your better judgment, you agree to help Arthur up. As you lift him, he becomes extremely dizzy from the head injury and nearly collapses. You have to support his full weight.

You manage to get him into his chair, but he's now very pale, nauseous, and his wrist is throbbing with increased pain from the movement.

You realize you should have called 999 first. You call now, but Arthur's condition has worsened due to being moved.

The paramedics are concerned when they arrive. Arthur requires hospitalization, and your manager is notified about the incident.

This is a learning experience about maintaining professional boundaries and not letting a client's preferences override your professional judgment in safety-critical situations.`,
      null,
      true,
      -10,
      -10,
    ]
  );

  // CALL OFFICE PATH
  const callOfficeNode = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'call_office',
      `You call your office coordinator and explain the situation. They immediately tell you: "That's a clear 999 call. Head injury plus suspected fracture - call an ambulance now."

You've lost about 3 minutes that could have been spent getting help on the way. You call 999 and provide the information.`,
      'While waiting for the ambulance, what do you do?',
      false,
      0,
      -5,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      callOfficeNode.rows[0].id,
      'Keep Arthur still and comfortable, monitor his condition, prepare his information for the paramedics',
      'office_call_ending',
      true,
      false,
      'Good recovery. You\'re now doing the right things, despite the delayed start.',
    ]
  );

  // OFFICE CALL ENDING
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'office_call_ending',
      `You provide good care while waiting for the ambulance, keeping Arthur comfortable and monitoring his condition.

The paramedics arrive and you give them a good handover. Arthur is taken to hospital and treated for a fractured wrist and mild concussion.

The outcome is good, though your manager later discusses with you the importance of trusting your own assessment in emergency situations. The signs clearly indicated a 999 call - you didn't need to seek permission.

This is a learning opportunity about clinical confidence and decision-making.`,
      null,
      true,
      10,
      0,
    ]
  );

  // PREMATURE 999 PATH
  const premature999Node = await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      scenarioId,
      'premature_999',
      `You call 999 immediately. The dispatcher asks: "What's the patient's condition?"

You realize you haven't actually assessed Arthur properly yet. You have to put the dispatcher on hold while you do a rapid assessment.

This works out, but the dispatcher seems slightly frustrated at the lack of information. You should have assessed first so you could provide clear, accurate information from the start of the call.`,
      'What do you do while waiting for the ambulance?',
      false,
      5,
      0,
    ]
  );

  await db.query(
    `INSERT INTO scenario_choices (node_id, choice_text, next_node_key, is_best_practice, is_valid_alternative, feedback_text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      premature999Node.rows[0].id,
      'Keep Arthur comfortable and monitor him, gather his medical information',
      'premature_ending',
      true,
      false,
      'Good. You\'re providing appropriate ongoing care despite the rushed initial call.',
    ]
  );

  // PREMATURE ENDING
  await db.query(
    `INSERT INTO scenario_nodes (scenario_id, node_key, content, question, is_ending, client_status_impact, wellbeing_impact)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      scenarioId,
      'premature_ending',
      `The ambulance arrives and you hand over to the paramedics. Arthur is taken to hospital and treated successfully.

Your response was appropriate overall, though calling 999 before assessment meant you couldn't give the dispatcher accurate information immediately.

In future, remember: Assess, then Act. Even a 30-second rapid assessment provides crucial information that helps emergency services prepare appropriately.

The outcome is good, and you showed good instincts about the seriousness of the situation.`,
      null,
      true,
      12,
      3,
    ]
  );
}

// Run if called directly
if (require.main === module) {
  seedScenarioContent()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedScenarioContent };
