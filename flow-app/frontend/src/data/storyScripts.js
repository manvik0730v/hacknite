// Each story event has an id and a sequence of { character, lines[] }
export const STORY_EVENTS = {
  onboarding_complete: [
    { character: 'Aarav', lines: ["Hey. You're new here, right?"] },
    { character: 'Mira',  lines: ["Don't worry, it's simple. Just move, track your steps, complete a few tasks."] },
    { character: 'Aarav', lines: ["Start small. Consistency matters more than intensity."] },
  ],
  first_uptown_quest: [
    { character: 'Mira',  lines: ["Nice… you actually did it."] },
    { character: 'Aarav', lines: ["Most people quit before this point."] },
    { character: 'Mira',  lines: ["Let's see how far you go."] },
    { character: 'Aarav', lines: ["You're improving."] },
    { character: 'Mira',  lines: ["Not just physically… something else too."] },
    { character: 'Aarav', lines: ["Keep going."] },
  ],
  first_sincity_open: [
    { character: 'Mira',  lines: ["…so you found it.", "You weren't supposed to. Not this early.", "But I guess you're not like the others."] },
    { character: 'Mira',  lines: ["This isn't Uptown.", "This is what's underneath."] },
    { character: 'Mira',  lines: ["Here… movement means control.", "Distance means power."] },
    { character: 'Aarav', lines: ["So you crossed over.", "Good."] },
    { character: 'Aarav', lines: ["No more casual tracking.", "No more comfort."] },
    { character: 'Mira',  lines: ["Every region you see…", "Someone owns it."] },
    { character: 'Aarav', lines: ["And if no one does…", "Take it."] },
  ],
  first_sincity_map: [
    { character: 'Mira',  lines: ["You see that man?", "He is not some random guy."] },
    { character: 'Aarav', lines: ["Go there and complete the special quest.", "Earn it."] },
  ],
  special_quest_intro: [
    { character: 'Stranger', lines: ["You made it here.", "Good. That means you're active."] },
    { character: 'Stranger', lines: ["This district is unstable.", "Cover 2 km here.", "Claim presence."] },
  ],
  special_quest_fail: [
    { character: 'Mira',  lines: ["You slowed down."] },
    { character: 'Aarav', lines: ["And someone else didn't."] },
    { character: 'Mira',  lines: ["Try again. Or stay irrelevant."] },
  ],
  special_quest_complete: [
    { character: 'Mira',  lines: ["…not bad."] },
    { character: 'Aarav', lines: ["You're starting to understand."] },
    { character: 'Mira',  lines: ["But don't get comfortable.", "This city doesn't reward comfort."] },
  ],
  return_to_uptown: [
    { character: 'Mira',  lines: ["You're back."] },
    { character: 'Aarav', lines: ["Everything still looks the same… right?"] },
    { character: 'Mira',  lines: ["But you feel it now."] },
  ],
};
