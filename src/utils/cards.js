// Example DeathStrike cards
const deathstrikeCards = [
    {
        id: 'vengeful_spirit',
        name: 'Vengeful Spirit',
        cost: 3,
        attack: 2,
        health: 3,
        effect: {
            type: 'deathstrike',
            action: 'damage',
            value: 2,
            targetType: 'any'
        },
        description: 'When this unit dies, deal 2 damage to any unit'
    },
    {
        id: 'soul_collector',
        name: 'Soul Collector',
        cost: 4,
        attack: 3,
        health: 4,
        effect: {
            type: 'deathstrike',
            action: 'draw',
            value: 2
        },
        description: 'When this unit dies, draw 2 cards'
    },
    {
        id: 'vengeance_bearer',
        name: 'Vengeance Bearer',
        cost: 5,
        attack: 4,
        health: 5,
        effect: {
            type: 'deathstrike',
            action: 'buff',
            value: {
                attack: 2,
                health: 2
            }
        },
        description: 'When this unit dies, give a friendly unit +2/+2'
    }
];

// Example Strike cards
const strikeCards = [
    {
        id: 'berserker',
        name: 'Berserker',
        cost: 2,
        attack: 2,
        health: 3,
        effect: {
            type: 'strike',
            action: 'damage',
            value: 1,
            followup: {
                action: 'buff',
                value: {
                    attack: 2
                }
            }
        },
        description: 'When this unit attacks, take 1 damage and gain +2 attack until end of turn'
    },
    {
        id: 'blood_mage',
        name: 'Blood Mage',
        cost: 3,
        attack: 2,
        health: 4,
        effect: {
            type: 'strike',
            action: 'damage',
            value: 2,
            followup: {
                action: 'buff',
                value: {
                    attack: 3
                }
            }
        },
        description: 'When this unit attacks, take 2 damage and gain +3 attack until end of turn'
    },
    {
        id: 'healing_striker',
        name: 'Healing Striker',
        cost: 4,
        attack: 3,
        health: 5,
        effect: {
            type: 'strike',
            action: 'heal',
            value: 2,
            followup: {
                action: 'buff',
                value: {
                    attack: 1
                }
            }
        },
        description: 'When this unit attacks, heal 2 health and gain +1 attack until end of turn'
    }
];

// Add new cards to the card pool
const cardPool = [
    // ... existing cards ...
    ...deathstrikeCards,
    ...strikeCards
]; 