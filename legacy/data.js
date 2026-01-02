const ROLES = {
            mayor: { name: 'Mayor', description: 'Political leader, starts each round, enacts policies' },
            prospector: { name: 'Prospector', description: 'Generates gold but cannot deposit VPs this round' },
            producer: { name: 'Producer', description: 'Buildings produce +1 goods this round' },
            architect: { name: 'Architect', description: 'Construction discount, can place servants on occupied build spaces' },
            thieves_guildmaster: { name: 'Thieves Guildmaster', description: 'Blocks one action space, -1 gold assassination cost' },
            merchant: { name: 'Merchant', description: 'Enables player-to-player trades, bonus trading actions' },
            recruiter: { name: 'Recruiter', description: 'Grants an extra servant this round' }
        };

const LOCATIONS = {
            city_hall: { 
                name: 'City Hall', 
                description: 'Lobby to adjust political influence (±1 per servant, 1 gold cost)',
                closed: false 
            },
            thieves_guild: { 
                name: 'Thieves Guild', 
                description: 'Attempt assassination (5 gold base cost)',
                closed: false 
            },
            marketplace: { 
                name: 'Marketplace', 
                description: 'Trade goods for gold (1 good = 2 gold)',
                closed: false 
            },
            recruitment_office: { 
                name: 'Recruitment Office', 
                description: 'Recruit servants (3 gold) or draw henchman cards',
                closed: false 
            },
            printing_press: { 
                name: 'Printing Press', 
                description: 'Draw or play news article cards',
                closed: false 
            },
            production_hall: { 
                name: 'Production Hall', 
                description: 'Produce goods based on buildings owned',
                closed: false 
            },
            construction_yard: { 
                name: 'Construction Yard', 
                description: 'Build buildings (costs vary, architect gets discount)',
                closed: false 
            }
        };

const POLICIES = {
            taxation: { 
                name: 'Taxation', 
                description: 'All players pay 1 gold per servant to treasury' 
            },
            corruption: { 
                name: 'Corruption', 
                description: 'Players may pay 3 gold for +1 influence or lose 1 influence for +2 gold' 
            },
            conscription: { 
                name: 'Conscription', 
                description: 'Players may spend influence to recruit servants; recruiting action unavailable' 
            },
            subsidy: { 
                name: 'Subsidy', 
                description: 'Building construction costs reduced by 3 gold this turn' 
            },
            martial_law: { 
                name: 'Martial Law', 
                description: 'All players lose 1 influence; Thieves Guild closed' 
            },
            censorship: { 
                name: 'Censorship', 
                description: 'All players discard one news card; Printing Press closed' 
            },
            embargo: { 
                name: 'Embargo', 
                description: 'Marketplace closed; mayor chooses one goods type to discard' 
            },
            hands_off: { 
                name: 'Hands-off', 
                description: 'All players draw and play one henchman card immediately' 
            }
        };

const GOODS_TYPES = {
            grain: { name: 'Grain', value: 1, description: 'Basic agricultural produce' },
            cloth: { name: 'Cloth', value: 2, description: 'Woven textiles' },
            tools: { name: 'Tools', value: 3, description: 'Crafted implements' },
            jewelry: { name: 'Jewelry', value: 4, description: 'Precious ornaments' },
            spices: { name: 'Spices', value: 5, description: 'Exotic luxury goods' }
        };

const BUILDINGS = {
            guardhouse: { 
                name: 'Guardhouse', 
                cost: 8, 
                description: 'Increases assassination cost against you by +1 gold' 
            },
            trade_depot: { 
                name: 'Trade Depot', 
                cost: 10, 
                description: 'Trade one additional good at Marketplace; enables player trading' 
            },
            library: { 
                name: 'Library', 
                cost: 6, 
                description: 'Grants one free news article card per round' 
            },
            barracks: { 
                name: 'Barracks', 
                cost: 7, 
                description: 'Grants one free henchman card per round' 
            },
            market_stalls: { 
                name: 'Market Stalls', 
                cost: 9, 
                description: 'Increase gold gained from goods traded by +1' 
            },
            manufactory: { 
                name: 'Manufactory', 
                cost: 12, 
                description: 'Produces +1 good each round' 
            },
            town_square: { 
                name: 'Town Square', 
                cost: 8, 
                description: '+1 political influence per Lobby action' 
            },
            spy_network: { 
                name: 'Spy Network', 
                cost: 11, 
                description: 'Place servant to peek at another player\'s banked VPs or cards' 
            }
        };