// Game Data
        

        

        

        

        

        const STARTING_CHOICES = [
            {
                name: 'Noble Heritage',
                description: 'Born to privilege and influence',
                rewards: { gold: 3, political_influence: 2 }
            },
            {
                name: 'Merchant Background',
                description: 'Started with trade connections and coin',
                rewards: { gold: 8, political_influence: 0 }
            },
            {
                name: 'Military Service',
                description: 'Earned respect through valor',
                rewards: { gold: 2, political_influence: 1, buildings: ['guardhouse'] }
            },
            {
                name: 'Scholar\'s Path',
                description: 'Knowledge is power',
                rewards: { gold: 1, political_influence: 0, buildings: ['library'] }
            },
            {
                name: 'Artisan Guild',
                description: 'Master of crafts and construction',
                rewards: { gold: 6, political_influence: 0, buildings: ['manufactory'] }
            },
            {
                name: 'Court Connections',
                description: 'Well-connected in political circles',
                rewards: { gold: 4, political_influence: 3, henchman_cards: 2 }
            }
        ];

        // Main Game Engine
        class MedievalIntrigueEngine {
            constructor() {
                this.players = [];
                this.currentPlayerIndex = 0;
                this.mayorIndex = 0;
                this.currentRound = 1;
                this.maxRounds = 12;
                this.gameState = 'setup'; // setup, election, role_selection, action_placement, finished
                this.gamePhase = 'setup';
                this.gameLog = [];
                this.currentPolicy = null;
                this.selectedPolicy = null;
                this.actionSlots = {}; // Track occupied action slots
                this.roleSelectionOrder = [];
                this.currentRoleSelector = 0;
                this.selectedRoles = {};
                this.votingResults = {};
                this.currentVoter = 0;
                this.playerStartingChoices = {};
                this.currentStartingPlayer = 0;
                
                this.initializeGame();
            }

            initializeGame() {
                // Show setup panel initially
                this.showSetupPanel();
            }

            startNewGame() {
                const playerCount = parseInt(document.getElementById('player-count').value);
                
                // Create players
                this.players = [];
                for (let i = 1; i <= playerCount; i++) {
                    this.players.push({
                        id: i,
                        name: `Player ${i}`,
                        gold: 5, // Base starting gold
                        goods: {},
                        political_influence: 1,
                        servants_available: 2,
                        servants_total: 2,
                        victory_points: 0,
                        role: null,
                        buildings: [],
                        henchman_cards: [],
                        news_cards: [],
                        extra_servants: 0 // Temporary servants from roles
                    });
                }

                // Initialize game state
                this.currentRound = 1;
                this.mayorIndex = 0; // Start with Player 1 as mayor
                this.gameState = 'starting_choices';
                this.currentStartingPlayer = 0;
                
                // Initialize action slots based on player count
                this.initializeActionSlots(playerCount);
                
                this.log('Game started with ' + playerCount + ' players!');
                this.showStartingChoices();
            }

            showStartingChoices() {
                if (this.currentStartingPlayer >= this.players.length) {
                    // All players have chosen, start the game
                    this.beginFirstRound();
                    return;
                }

                const player = this.players[this.currentStartingPlayer];
                document.getElementById('starting-player-name').textContent = player.name;
                
                const cardsContainer = document.getElementById('starting-cards');
                cardsContainer.innerHTML = '';
                
                STARTING_CHOICES.forEach((choice, index) => {
                    const card = document.createElement('div');
                    card.className = 'starting-card';
                    card.onclick = () => this.selectStartingChoice(index);
                    card.innerHTML = `
                        <div class="card-title">${choice.name}</div>
                        <div style="margin-bottom: 10px;">${choice.description}</div>
                        <div><strong>Rewards:</strong></div>
                        <div>• Gold: +${choice.rewards.gold}</div>
                        <div>• Influence: +${choice.rewards.political_influence}</div>
                        ${choice.rewards.buildings ? `<div>• Building: ${choice.rewards.buildings[0]}</div>` : ''}
                        ${choice.rewards.henchman_cards ? `<div>• Henchman Cards: ${choice.rewards.henchman_cards}</div>` : ''}
                    `;
                    cardsContainer.appendChild(card);
                });
                
                document.getElementById('starting-cards-modal').style.display = 'block';
            }

            selectStartingChoice(choiceIndex) {
                // Clear previous selection
                document.querySelectorAll('.starting-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Select new choice
                document.querySelectorAll('.starting-card')[choiceIndex].classList.add('selected');
                this.playerStartingChoices[this.currentStartingPlayer] = choiceIndex;
                document.getElementById('confirm-starting-btn').disabled = false;
            }

            confirmStartingChoice() {
                const player = this.players[this.currentStartingPlayer];
                const choiceIndex = this.playerStartingChoices[this.currentStartingPlayer];
                const choice = STARTING_CHOICES[choiceIndex];
                
                // Apply rewards
                player.gold += choice.rewards.gold;
                player.political_influence += choice.rewards.political_influence;
                
                if (choice.rewards.buildings) {
                    player.buildings.push(...choice.rewards.buildings);
                }
                
                if (choice.rewards.henchman_cards) {
                    for (let i = 0; i < choice.rewards.henchman_cards; i++) {
                        player.henchman_cards.push(`Henchman Card ${i + 1}`); // Placeholder
                    }
                }
                
                this.log(`${player.name} chose ${choice.name} background`);
                
                document.getElementById('starting-cards-modal').style.display = 'none';
                this.currentStartingPlayer++;
                this.showStartingChoices();
            }

            beginFirstRound() {
                this.gameState = 'election';
                this.showGameElements();
                this.updateDisplay();
                this.startMayorElection();
            }

            initializeActionSlots(playerCount) {
                const slotsPerLocation = playerCount === 3 ? 2 : 3;
                
                Object.keys(LOCATIONS).forEach(locationId => {
                    this.actionSlots[locationId] = [];
                    for (let i = 0; i < slotsPerLocation; i++) {
                        this.actionSlots[locationId].push(null); // null = empty, playerId = occupied
                    }
                });
            }

            startMayorElection() {
                this.log(`Starting Mayor Election for Round ${this.currentRound}`);
                this.currentVoter = 0;
                this.votingResults = {};
                
                // Reset all votes
                this.players.forEach(player => {
                    this.votingResults[player.id] = { votes: 0, voters: [] };
                });
                
                document.getElementById('election-round').textContent = this.currentRound;
                this.showVotingInterface();
            }

            showVotingInterface() {
                if (this.currentVoter >= this.players.length) {
                    this.tallyVotes();
                    return;
                }
                
                const voter = this.players[this.currentVoter];
                
                // Update voter display
                document.getElementById('current-voter-name').textContent = voter.name;
                document.getElementById('current-voter-influence').textContent = voter.political_influence;
                
                // Create vote buttons
                const voteButtons = document.getElementById('vote-buttons');
                voteButtons.innerHTML = '';
                
                this.players.forEach(player => {
                    const btn = document.createElement('button');
                    btn.className = 'btn';
                    btn.textContent = `Vote for ${player.name}`;
                    btn.onclick = () => this.castVote(player.id);
                    voteButtons.appendChild(btn);
                });
                
                // Update live vote tally
                this.updateLiveVoteTally();
                
                // Update player influence display
                this.updatePlayerInfluenceDisplay();
                
                document.getElementById('mayor-modal').style.display = 'block';
                this.log(`${voter.name} is casting their vote...`);
            }

            updateLiveVoteTally() {
                const tallyDiv = document.getElementById('live-vote-tally');
                let tallyHtml = '';
                
                this.players.forEach(player => {
                    const votes = this.votingResults[player.id].votes;
                    const voters = this.votingResults[player.id].voters;
                    tallyHtml += `
                        <div style="margin-bottom: 8px;">
                            <strong>${player.name}:</strong> ${votes} votes
                            ${voters.length > 0 ? `<br><span style="font-size: 0.8rem; color: #cd853f;">Voted by: ${voters.join(', ')}</span>` : ''}
                        </div>
                    `;
                });
                
                tallyDiv.innerHTML = tallyHtml;
            }

            updatePlayerInfluenceDisplay() {
                const influenceDiv = document.getElementById('player-influence-display');
                let influenceHtml = '';
                
                this.players.forEach(player => {
                    influenceHtml += `
                        <div style="margin-bottom: 5px;">
                            <strong>${player.name}:</strong> ${player.political_influence} influence
                        </div>
                    `;
                });
                
                influenceDiv.innerHTML = influenceHtml;
            }

            castVote(candidateId) {
                const voter = this.players[this.currentVoter];
                const candidate = this.players.find(p => p.id === candidateId);
                
                // Weight vote by political influence
                this.votingResults[candidateId].votes += voter.political_influence;
                this.votingResults[candidateId].voters.push(voter.name);
                
                this.log(`${voter.name} voted for ${candidate.name} (${voter.political_influence} influence)`);
                
                this.currentVoter++;
                this.showVotingInterface();
            }

            tallyVotes() {
                let maxVotes = 0;
                let winners = [];
                
                Object.keys(this.votingResults).forEach(playerId => {
                    const votes = this.votingResults[playerId].votes;
                    if (votes > maxVotes) {
                        maxVotes = votes;
                        winners = [parseInt(playerId)];
                    } else if (votes === maxVotes && votes > 0) {
                        winners.push(parseInt(playerId));
                    }
                });
                
                // Handle ties - current mayor or closest clockwise wins
                if (winners.length > 1) {
                    const currentMayorInWinners = winners.includes(this.players[this.mayorIndex].id);
                    if (currentMayorInWinners) {
                        this.mayorIndex = this.players.findIndex(p => p.id === this.players[this.mayorIndex].id);
                    } else {
                        // Find closest to current mayor clockwise
                        let closestDistance = this.players.length;
                        let newMayor = winners[0];
                        
                        winners.forEach(winnerId => {
                            const winnerIndex = this.players.findIndex(p => p.id === winnerId);
                            let distance = (winnerIndex - this.mayorIndex + this.players.length) % this.players.length;
                            if (distance === 0) distance = this.players.length;
                            
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                newMayor = winnerId;
                            }
                        });
                        
                        this.mayorIndex = this.players.findIndex(p => p.id === newMayor);
                    }
                } else if (winners.length === 1) {
                    this.mayorIndex = this.players.findIndex(p => p.id === winners[0]);
                }
                
                this.showElectionResults();
            }

            showElectionResults() {
                const resultsDiv = document.getElementById('vote-tally');
                const voteButtons = document.getElementById('vote-buttons');
                const currentVoterSection = document.querySelector('.voting-section');
                
                // Hide voting interface
                currentVoterSection.style.display = 'none';
                
                let resultsHtml = '<div style="margin-bottom: 15px;"><strong>Final Vote Results:</strong></div>';
                
                Object.keys(this.votingResults).forEach(playerId => {
                    const player = this.players.find(p => p.id === parseInt(playerId));
                    const result = this.votingResults[playerId];
                    resultsHtml += `<div>${player.name}: ${result.votes} votes</div>`;
                });
                
                const mayor = this.players[this.mayorIndex];
                resultsHtml += `<div style="margin-top: 15px; font-weight: bold; color: #daa520;">🏆 ${mayor.name} is elected Mayor!</div>`;
                
                resultsDiv.innerHTML = resultsHtml;
                document.getElementById('election-results').style.display = 'block';
                
                this.log(`${mayor.name} elected as Mayor for Round ${this.currentRound}!`);
            }

            finishElection() {
                document.getElementById('mayor-modal').style.display = 'none';
                
                // Reset voting interface for next round
                document.querySelector('.voting-section').style.display = 'block';
                document.getElementById('election-results').style.display = 'none';
                
                this.gameState = 'role_selection';
                this.startRoleSelection();
            }

            startRoleSelection() {
                // Set up role selection order (counterclockwise from mayor)
                this.roleSelectionOrder = [];
                for (let i = 1; i < this.players.length; i++) {
                    const index = (this.mayorIndex - i + this.players.length) % this.players.length;
                    this.roleSelectionOrder.push(index);
                }
                
                // Mayor gets Mayor role automatically
                this.selectedRoles = { [this.mayorIndex]: 'mayor' };
                this.players[this.mayorIndex].role = 'mayor';
                
                this.currentRoleSelector = 0;
                this.log('Role selection begins...');
                this.showRoleSelection();
            }

            showRoleSelection() {
                if (this.currentRoleSelector >= this.roleSelectionOrder.length) {
                    this.finishRoleSelection();
                    return;
                }
                
                const playerIndex = this.roleSelectionOrder[this.currentRoleSelector];
                const player = this.players[playerIndex];
                
                document.getElementById('role-selector-name').textContent = player.name;
                
                const rolesGrid = document.getElementById('roles-grid');
                rolesGrid.innerHTML = '';
                
                Object.keys(ROLES).forEach(roleId => {
                    if (roleId === 'mayor') return; // Mayor already assigned
                    
                    const role = ROLES[roleId];
                    const isThisPlayer = this.selectedRoles[playerIndex] === roleId;
                    const isTaken = Object.values(this.selectedRoles).includes(roleId);
                    
                    const roleCard = document.createElement('div');
                    roleCard.className = `role-card ${isThisPlayer ? 'selected' : ''} ${isTaken ? 'taken' : ''}`;
                    
                    if (!isTaken) {
                        roleCard.onclick = () => this.selectRole(roleId);
                    }
                    
                    roleCard.innerHTML = `
                        <div style="font-weight: bold; margin-bottom: 8px;">${role.name}</div>
                        <div style="font-size: 0.9rem;">${role.description}</div>
                    `;
                    
                    rolesGrid.appendChild(roleCard);
                });
                
                document.getElementById('role-modal').style.display = 'block';
                document.getElementById('confirm-role-btn').disabled = !this.selectedRoles[playerIndex] || this.selectedRoles[playerIndex] === 'mayor';
            }

            selectRole(roleId) {
                const playerIndex = this.roleSelectionOrder[this.currentRoleSelector];
                
                // Clear previous selection for this player
                if (this.selectedRoles[playerIndex] && this.selectedRoles[playerIndex] !== 'mayor') {
                    delete this.selectedRoles[playerIndex];
                }
                
                // Select new role
                this.selectedRoles[playerIndex] = roleId;
                
                // Update UI
                document.querySelectorAll('.role-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                const selectedCard = Array.from(document.querySelectorAll('.role-card')).find(card => 
                    card.textContent.includes(ROLES[roleId].name)
                );
                if (selectedCard) {
                    selectedCard.classList.add('selected');
                }
                
                document.getElementById('confirm-role-btn').disabled = false;
            }

            confirmRoleSelection() {
                const playerIndex = this.roleSelectionOrder[this.currentRoleSelector];
                const player = this.players[playerIndex];
                const roleId = this.selectedRoles[playerIndex];
                
                player.role = roleId;
                this.applyRoleEffects(player, roleId);
                
                this.log(`${player.name} selected ${ROLES[roleId].name}`);
                
                document.getElementById('role-modal').style.display = 'none';
                this.currentRoleSelector++;
                this.showRoleSelection();
            }

            applyRoleEffects(player, roleId) {
                switch(roleId) {
                    case 'recruiter':
                        player.extra_servants = 1;
                        this.log(`${player.name} gains an extra servant this round`);
                        break;
                    case 'thieves_guildmaster':
                        // Block one action space (implementation needed)
                        this.log(`${player.name} can block one action space`);
                        break;
                    // Add other role effects as needed
                }
            }

            finishRoleSelection() {
                this.gameState = 'policy_selection';
                this.showPolicySelection();
            }

            showPolicySelection() {
                const mayor = this.players[this.mayorIndex];
                document.getElementById('policy-selector-name').textContent = mayor.name;
                
                const policiesGrid = document.getElementById('policies-grid');
                policiesGrid.innerHTML = '';
                
                Object.keys(POLICIES).forEach(policyId => {
                    const policy = POLICIES[policyId];
                    const isSelected = this.selectedPolicy === policyId;
                    
                    const policyCard = document.createElement('div');
                    policyCard.className = `role-card ${isSelected ? 'selected' : ''}`;
                    policyCard.onclick = () => this.selectPolicy(policyId);
                    
                    policyCard.innerHTML = `
                        <div style="font-weight: bold; margin-bottom: 8px;">${policy.name}</div>
                        <div style="font-size: 0.9rem;">${policy.description}</div>
                    `;
                    
                    policiesGrid.appendChild(policyCard);
                });
                
                document.getElementById('policy-modal').style.display = 'block';
                document.getElementById('confirm-policy-btn').disabled = !this.selectedPolicy;
            }

            selectPolicy(policyId) {
                // Clear previous selection
                this.selectedPolicy = policyId;
                
                // Update UI
                document.querySelectorAll('#policies-grid .role-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                const selectedCard = Array.from(document.querySelectorAll('#policies-grid .role-card')).find(card => 
                    card.textContent.includes(POLICIES[policyId].name)
                );
                if (selectedCard) {
                    selectedCard.classList.add('selected');
                }
                
                document.getElementById('confirm-policy-btn').disabled = false;
            }

            confirmPolicySelection() {
                const mayor = this.players[this.mayorIndex];
                const policyId = this.selectedPolicy;
                
                this.currentPolicy = policyId;
                this.applyPolicy(policyId);
                
                this.log(`Mayor ${mayor.name} enacted ${POLICIES[policyId].name} policy`);
                
                document.getElementById('policy-modal').style.display = 'none';
                this.gameState = 'action_placement';
                this.startActionPlacement();
            }

            applyPolicy(policyId) {
                const policy = POLICIES[policyId];
                
                // Apply policy effects
                switch(policyId) {
                    case 'martial_law':
                        this.players.forEach(player => {
                            player.political_influence = Math.max(0, player.political_influence - 1);
                        });
                        LOCATIONS.thieves_guild.closed = true;
                        this.log('All players lose 1 political influence. Thieves Guild closed.');
                        break;
                    case 'censorship':
                        LOCATIONS.printing_press.closed = true;
                        this.log('Printing Press closed this round.');
                        break;
                    case 'embargo':
                        LOCATIONS.marketplace.closed = true;
                        this.log('Marketplace closed this round.');
                        break;
                    // Add other policy implementations
                }
            }

            startActionPlacement() {
                this.log('Action placement phase begins!');
                this.currentPlayerIndex = this.mayorIndex; // Start with mayor
                this.updateDisplay();
                this.renderLocations();
            }

            renderLocations() {
                const container = document.getElementById('locations-container');
                container.innerHTML = '';
                
                Object.keys(LOCATIONS).forEach(locationId => {
                    const location = LOCATIONS[locationId];
                    const locationDiv = document.createElement('div');
                    locationDiv.className = `location ${location.closed ? 'closed' : ''}`;
                    
                    locationDiv.innerHTML = `
                        <div class="location-name">${location.name}</div>
                        <div style="font-size: 0.9rem; margin-bottom: 10px;">${location.description}</div>
                        <div class="location-slots" id="slots-${locationId}"></div>
                    `;
                    
                    container.appendChild(locationDiv);
                    
                    // Render action slots
                    this.renderActionSlots(locationId);
                });
            }

            renderActionSlots(locationId) {
                const slotsContainer = document.getElementById(`slots-${locationId}`);
                slotsContainer.innerHTML = '';
                
                this.actionSlots[locationId].forEach((occupant, index) => {
                    const slot = document.createElement('div');
                    slot.className = 'servant-slot';
                    
                    if (occupant !== null) {
                        slot.classList.add('occupied');
                        slot.textContent = occupant;
                    } else if (!LOCATIONS[locationId].closed) {
                        slot.onclick = () => this.placeServant(locationId, index);
                    }
                    
                    if (LOCATIONS[locationId].closed) {
                        slot.classList.add('blocked');
                    }
                    
                    slotsContainer.appendChild(slot);
                });
            }

            placeServant(locationId, slotIndex) {
                const currentPlayer = this.getCurrentPlayer();
                
                if (currentPlayer.servants_available <= 0) {
                    this.log(`${currentPlayer.name} has no servants available!`);
                    return;
                }
                
                if (this.actionSlots[locationId][slotIndex] !== null) {
                    this.log('That slot is already occupied!');
                    return;
                }
                
                // Place servant
                this.actionSlots[locationId][slotIndex] = currentPlayer.id;
                currentPlayer.servants_available--;
                
                this.log(`${currentPlayer.name} placed a servant at ${LOCATIONS[locationId].name}`);
                this.renderActionSlots(locationId);
                this.updateDisplay();
            }

            nextPhase() {
                if (this.gameState === 'action_placement') {
                    // Move to next player or resolve actions
                    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                    
                    if (this.currentPlayerIndex === this.mayorIndex) {
                        // Full round completed, resolve actions
                        this.resolveActions();
                    } else {
                        this.log(`${this.getCurrentPlayer().name}'s turn to place servants`);
                        this.updateDisplay();
                    }
                } else {
                    this.nextRound();
                }
            }

            resolveActions() {
                // This method is no longer needed since actions are resolved immediately
                // when servants are placed, but kept for any cleanup if needed
                this.log('All actions have been resolved throughout the round!');
                this.endRound();
            }

            resolveLocationActions(locationId) {
                // This method is no longer needed since we resolve actions immediately
                // Keeping for compatibility but it won't be called in the new flow
            }

            executeLocationAction(player, locationId) {
                switch(locationId) {
                    case 'city_hall':
                        if (player.gold >= 1) {
                            player.gold--;
                            // In real implementation, player would choose target and +/- influence
                            this.log(`${player.name} lobbied (spent 1 gold)`);
                        }
                        break;
                    case 'marketplace':
                        // Simple implementation: trade 1 random good for 2 gold
                        const goodTypes = Object.keys(player.goods).filter(type => player.goods[type] > 0);
                        if (goodTypes.length > 0) {
                            const goodType = goodTypes[0];
                            player.goods[goodType]--;
                            player.gold += 2;
                            this.log(`${player.name} traded ${goodType} for 2 gold`);
                        }
                        break;
                    case 'production_hall':
                        // Produce goods based on buildings
                        let produced = 0;
                        player.buildings.forEach(building => {
                            if (building === 'manufactory') {
                                if (!player.goods.grain) player.goods.grain = 0;
                                player.goods.grain++;
                                produced++;
                            }
                        });
                        if (produced > 0) {
                            this.log(`${player.name} produced ${produced} goods`);
                        }
                        break;
                    // Add other location actions
                }
            }

            endRound() {
                this.log(`Round ${this.currentRound} completed!`);
                
                // Reset for next round
                this.players.forEach(player => {
                    player.servants_available = player.servants_total + player.extra_servants;
                    player.extra_servants = 0;
                    player.role = null;
                });
                
                // Clear action slots and policy selection
                Object.keys(this.actionSlots).forEach(locationId => {
                    this.actionSlots[locationId] = this.actionSlots[locationId].map(() => null);
                    LOCATIONS[locationId].closed = false; // Reset closed status
                });
                
                this.currentPolicy = null;
                this.selectedPolicy = null;
                
                this.currentRound++;
                
                if (this.currentRound > this.maxRounds) {
                    this.endGame();
                } else {
                    // Start new round with mayor election
                    this.gameState = 'election';
                    this.startMayorElection();
                }
            }

            endGame() {
                this.gameState = 'finished';
                
                // Sort players by victory points
                const sortedPlayers = [...this.players].sort((a, b) => b.victory_points - a.victory_points);
                
                this.log('Game finished!');
                this.log(`Winner: ${sortedPlayers[0].name} with ${sortedPlayers[0].victory_points} victory points!`);
                
                this.updateDisplay();
            }

            // Utility methods
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex];
            }

            getMayor() {
                return this.players[this.mayorIndex];
            }

            log(message) {
                const timestamp = new Date().toLocaleTimeString();
                this.gameLog.push(`[${timestamp}] ${message}`);
                this.updateGameLog();
            }

            updateDisplay() {
                if (this.gameState === 'setup') return;
                
                document.getElementById('current-round').textContent = this.currentRound;
                document.getElementById('current-mayor').textContent = this.getMayor().name;
                document.getElementById('current-phase').textContent = this.gameState.replace('_', ' ');
                
                // Update policy display
                if (this.currentPolicy) {
                    document.getElementById('policy-name').textContent = POLICIES[this.currentPolicy].name;
                    document.getElementById('policy-description').textContent = POLICIES[this.currentPolicy].description;
                }
                
                this.updatePlayerCards();
                this.updateButtons();
            }

            updatePlayerCards() {
                const container = document.getElementById('player-info');
                container.innerHTML = '';
                
                this.players.forEach((player, index) => {
                    const card = document.createElement('div');
                    card.className = `player-card ${index === this.currentPlayerIndex ? 'active' : ''} ${index === this.mayorIndex ? 'mayor' : ''}`;
                    
                    const goodsDisplay = Object.keys(player.goods).map(type => 
                        `${type}: ${player.goods[type] || 0}`
                    ).join(', ') || 'None';
                    
                    card.innerHTML = `
                        <div class="player-name">${player.name}</div>
                        ${player.role ? `<div class="player-role">${ROLES[player.role].name}</div>` : ''}
                        <div class="resource-grid">
                            <div>Gold: ${player.gold}</div>
                            <div>Influence: ${player.political_influence}</div>
                            <div>Servants: ${player.servants_available}/${player.servants_total}</div>
                            <div>VPs: ${player.victory_points}</div>
                        </div>
                        <div style="margin-top: 8px; font-size: 0.8rem;">
                            <div class="goods-display">
                                <span>Goods: </span>
                                <span>${goodsDisplay}</span>
                            </div>
                        </div>
                        ${player.buildings.length > 0 ? `<div style="margin-top: 5px; font-size: 0.8rem;">Buildings: ${player.buildings.join(', ')}</div>` : ''}
                    `;
                    
                    container.appendChild(card);
                });
            }

            updateButtons() {
                const nextBtn = document.getElementById('next-phase-btn');
                
                switch(this.gameState) {
                    case 'action_placement':
                        const currentPlayer = this.getCurrentPlayer();
                        if (currentPlayer.servants_available > 0) {
                            nextBtn.textContent = `${currentPlayer.name}: Place Servant`;
                            nextBtn.disabled = true; // Player must click location to place servant
                        } else {
                            nextBtn.textContent = 'Next Player';
                            nextBtn.disabled = false;
                        }
                        break;
                    case 'finished':
                        nextBtn.disabled = true;
                        break;
                    default:
                        nextBtn.textContent = 'Next Phase';
                        nextBtn.disabled = true;
                }
            }

            updateGameLog() {
                const container = document.getElementById('game-log');
                container.innerHTML = '';
                
                const recentLogs = this.gameLog.slice(-10);
                recentLogs.forEach(log => {
                    const entry = document.createElement('div');
                    entry.className = 'log-entry';
                    entry.textContent = log;
                    container.appendChild(entry);
                });
                
                container.scrollTop = container.scrollHeight;
            }

            showSetupPanel() {
                document.getElementById('setup-panel').style.display = 'block';
                document.getElementById('game-header').style.display = 'none';
                document.getElementById('player-info').style.display = 'none';
                document.getElementById('game-board').style.display = 'none';
                document.getElementById('game-controls').style.display = 'none';
            }

            showGameElements() {
                document.getElementById('setup-panel').style.display = 'none';
                document.getElementById('game-header').style.display = 'block';
                document.getElementById('player-info').style.display = 'grid';
                document.getElementById('game-board').style.display = 'grid';
                document.getElementById('game-controls').style.display = 'block';
            }

            resetGame() {
                location.reload(); // Simple reset for now
            }

            // Placeholder methods for additional features
            showLocationDetails() {
                alert('Location details feature coming soon!');
            }

            viewPlayerAssets() {
                alert('Player assets view coming soon!');
            }
        }

        // Initialize the game engine
        const gameEngine = new MedievalIntrigueEngine();
        
        // Override the initialization to use our custom start method
        gameEngine.initializeGame = function() {
            const playerCount = parseInt(document.getElementById('player-count').value);
            this.startNewGame();
        };