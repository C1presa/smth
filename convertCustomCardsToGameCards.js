// convertCustomCardsToGameCards.js
// Usage: node convertCustomCardsToGameCards.js
// Reads community_cards.json and outputs formatted_cards.js for easy integration into your game's codebase.

const fs = require('fs');
const path = require('path');

function convertCustomCardsToGameCards(inputFile = 'community_cards.json', outputFile = 'formatted_cards.js') {
  // Load the cards from the JSON file
  const customCards = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  // Format them for inclusion in cards.js
  const formattedCards = customCards.map(card => {
    // Handle type (array or string)
    let typeString;
    if (Array.isArray(card.type)) {
      typeString = `[${card.type.map(t => `UNIT_TYPES.${t.toUpperCase()}`).join(', ')}]`;
    } else {
      typeString = `UNIT_TYPES.${card.type.toUpperCase()}`;
    }

    return `createCard({
  id: ARCHETYPES.${card.archetype ? card.archetype.toUpperCase() : 'NEUTRAL'},
  name: "${card.name}",
  cost: ${card.cost},
  attack: ${card.attack},
  health: ${card.health},
  rarity: RARITIES.${card.rarity ? card.rarity.toUpperCase() : 'COMMON'},
  type: ${typeString},
  description: \
`${card.description || ''}`\
,
  effects: ${JSON.stringify(card.effects, null, 2)}
}),`;
  }).join('\n\n');

  // Output to a file
  fs.writeFileSync(outputFile, formattedCards);
  console.log(`Cards formatted and saved to ${outputFile}`);
}

// Run the function (you can pass custom filenames if needed)
convertCustomCardsToGameCards(); 