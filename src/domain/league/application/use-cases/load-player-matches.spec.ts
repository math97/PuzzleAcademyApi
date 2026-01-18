import { InMemoryMatchesRepository } from 'test/repositories/in-memory-matches-repository';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { LoadPlayerMatchesUseCase } from './load-player-matches';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { Player } from '../../enterprise/entities/player';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Match } from '../../enterprise/entities/match';
import { MatchParticipant } from '../../enterprise/entities/match-participant';

const RANKED_SOLO_QUEUE = 420;
const RANKED_FLEX_QUEUE = 440;

describe('Load Player Matches (Simple Flow)', () => {
    let inMemoryPlayersRepository: InMemoryPlayersRepository;
    let inMemoryMatchesRepository: InMemoryMatchesRepository;
    let riotApiGateway: RiotApiGateway;
    let sut: LoadPlayerMatchesUseCase;

    beforeEach(() => {
        inMemoryPlayersRepository = new InMemoryPlayersRepository();
        inMemoryMatchesRepository = new InMemoryMatchesRepository();
        riotApiGateway = {
            getSummoner: vi.fn(),
            getSummonerDetails: vi.fn(),
            getLeagueEntries: vi.fn(),
            getTopChampionMasteries: vi.fn(),
            getMatchesByPuuid: vi.fn().mockResolvedValue([]),
            getMatchDetails: vi.fn(),
        } as unknown as RiotApiGateway;

        sut = new LoadPlayerMatchesUseCase(
            inMemoryPlayersRepository,
            riotApiGateway,
            inMemoryMatchesRepository,
        );
    });

    it('should fetch matches from both ranked queues', async () => {
        // Setup Player
        const player = Player.create({
            name: 'Player One',
            tag: 'TAG1',
            riotPuiid: 'puuid1',
        }, new UniqueEntityId('player1'));
        await inMemoryPlayersRepository.insert(player);

        const getMatchesSpy = vi.fn()
            .mockResolvedValueOnce(['match1']) // Solo queue
            .mockResolvedValueOnce(['match2']); // Flex queue
        riotApiGateway.getMatchesByPuuid = getMatchesSpy;
        riotApiGateway.getMatchDetails = vi.fn().mockResolvedValue({
            info: {
                gameCreation: Date.now(),
                gameDuration: 1800,
                gameMode: 'CLASSIC',
                participants: [{ puuid: 'puuid1', riotIdGameName: 'P1', championName: 'Zed', kills: 1, deaths: 1, assists: 1, win: true, totalDamageDealt: 1000, visionScore: 10 }]
            }
        });

        await sut.execute({ playerId: 'player1' });

        expect(getMatchesSpy).toHaveBeenCalledTimes(2);
        expect(getMatchesSpy).toHaveBeenCalledWith('puuid1', undefined, undefined, RANKED_SOLO_QUEUE);
        expect(getMatchesSpy).toHaveBeenCalledWith('puuid1', undefined, undefined, RANKED_FLEX_QUEUE);
    });

    it('should deduplicate matches from both queues', async () => {
        // Setup Player
        const player = Player.create({
            name: 'Player One',
            tag: 'TAG1',
            riotPuiid: 'puuid1',
        }, new UniqueEntityId('player1'));
        await inMemoryPlayersRepository.insert(player);

        // Same match appears in both queues (edge case)
        riotApiGateway.getMatchesByPuuid = vi.fn()
            .mockResolvedValueOnce(['match1', 'match2'])
            .mockResolvedValueOnce(['match2', 'match3']);

        const getDetailsSpy = vi.fn().mockResolvedValue({
            info: {
                gameCreation: Date.now(),
                gameDuration: 1800,
                gameMode: 'CLASSIC',
                participants: [{ puuid: 'puuid1', riotIdGameName: 'P1', championName: 'Zed', kills: 1, deaths: 1, assists: 1, win: true, totalDamageDealt: 1000, visionScore: 10 }]
            }
        });
        riotApiGateway.getMatchDetails = getDetailsSpy;

        await sut.execute({ playerId: 'player1' });

        // Should only fetch details for 3 unique matches, not 4
        expect(getDetailsSpy).toHaveBeenCalledTimes(3);
    });

    it('should create new match and participant for current player', async () => {
        // Setup Player
        const player = Player.create({
            name: 'Player One',
            tag: 'TAG1',
            riotPuiid: 'puuid1',
        }, new UniqueEntityId('player1'));
        await inMemoryPlayersRepository.insert(player);

        // Mock Riot API - returns match1 from solo queue, empty from flex
        riotApiGateway.getMatchesByPuuid = vi.fn()
            .mockResolvedValueOnce(['match1'])
            .mockResolvedValueOnce([]);
        riotApiGateway.getMatchDetails = vi.fn().mockResolvedValue({
            info: {
                gameCreation: Date.now(),
                gameDuration: 1800,
                gameMode: 'CLASSIC',
                participants: [
                    {
                        puuid: 'puuid1',
                        riotIdGameName: 'Player One',
                        championName: 'Aatrox',
                        kills: 10,
                        deaths: 2,
                        assists: 5,
                        win: true,
                        totalDamageDealt: 20000,
                        visionScore: 15,
                    },
                    {
                        puuid: 'puuid2', // Other player
                        riotIdGameName: 'Other',
                        championName: 'Ahri',
                        kills: 0,
                        deaths: 0,
                        assists: 0,
                        win: false,
                    }
                ]
            }
        });

        // Execute
        await sut.execute({ playerId: 'player1' });

        // Verify
        const savedMatch = await inMemoryMatchesRepository.findByRiotMatchId('match1');
        expect(savedMatch).toBeTruthy();
        expect(savedMatch?.participants).toHaveLength(1); // Only Player 1 saved
        expect(savedMatch?.participants[0].puuid).toBe('puuid1');

        // Verify Stats
        const updatedPlayer = await inMemoryPlayersRepository.findById('player1');
        expect(updatedPlayer?.stats.totalKills).toBe(10);
    });

    it('should add participant to existing match if missing', async () => {
        // Setup Players
        const player1 = Player.create({ name: 'P1', tag: 'T1', riotPuiid: 'puuid1' }, new UniqueEntityId('player1'));
        const player2 = Player.create({ name: 'P2', tag: 'T2', riotPuiid: 'puuid2' }, new UniqueEntityId('player2'));
        await inMemoryPlayersRepository.insert(player1);
        await inMemoryPlayersRepository.insert(player2);

        // Pre-create match with ONLY Player 1
        const existingMatch = Match.create({
            riotMatchId: 'match1',
            gameCreation: new Date(),
            gameDuration: 1000,
            gameMode: 'CLASSIC',
            participants: [
                MatchParticipant.create({
                    puuid: 'puuid1',
                    summonerName: 'P1',
                    championName: 'Zed',
                    kills: 5, deaths: 1, assists: 1, win: true, totalDamageDealt: 1000, visionScore: 10
                })
            ]
        }, new UniqueEntityId('match_id_1'));
        await inMemoryMatchesRepository.create(existingMatch);

        // Mock Riot API (fetch Details needed for Player 2 data)
        riotApiGateway.getMatchesByPuuid = vi.fn()
            .mockResolvedValueOnce(['match1'])
            .mockResolvedValueOnce([]);
        riotApiGateway.getMatchDetails = vi.fn().mockResolvedValue({
            info: {
                gameCreation: Date.now(),
                gameDuration: 1000,
                gameMode: 'CLASSIC',
                participants: [
                    { puuid: 'puuid1', kills: 5, deaths: 1, assists: 1 },
                    {
                        puuid: 'puuid2',
                        riotIdGameName: 'P2',
                        championName: 'Yasuo',
                        kills: 0, deaths: 10, assists: 0,
                        win: true, totalDamageDealt: 500, visionScore: 5
                    }
                ]
            }
        });

        // Execute for Player 2
        await sut.execute({ playerId: 'player2' });

        // Verify Match now has 2 participants
        const savedMatch = await inMemoryMatchesRepository.findByRiotMatchId('match1');
        expect(savedMatch?.participants).toHaveLength(2);
        expect(savedMatch?.participants.find(p => p.puuid === 'puuid2')).toBeTruthy();

        // Verify Player 2 stats updated
        const updatedPlayer2 = await inMemoryPlayersRepository.findById('player2');
        expect(updatedPlayer2?.stats.totalDeaths).toBe(10);
    });

    it('should skip if participant already exists', async () => {
        // Setup Player
        const player1 = Player.create({ name: 'P1', tag: 'T1', riotPuiid: 'puuid1' }, new UniqueEntityId('player1'));
        await inMemoryPlayersRepository.insert(player1);

        // Pre-create match with Player 1
        const existingMatch = Match.create({
            riotMatchId: 'match1',
            gameCreation: new Date(),
            gameDuration: 1000,
            gameMode: 'CLASSIC',
            participants: [
                MatchParticipant.create({
                    puuid: 'puuid1',
                    summonerName: 'P1',
                    championName: 'Zed',
                    kills: 5, deaths: 1, assists: 1, win: true, totalDamageDealt: 1000, visionScore: 10
                })
            ]
        }, new UniqueEntityId('match_id_1'));
        await inMemoryMatchesRepository.create(existingMatch);

        riotApiGateway.getMatchesByPuuid = vi.fn()
            .mockResolvedValueOnce(['match1'])
            .mockResolvedValueOnce([]);

        // Spy on getMatchDetails to ensure it's NOT called
        const getDetailsSpy = vi.fn();
        riotApiGateway.getMatchDetails = getDetailsSpy;

        // Execute
        await sut.execute({ playerId: 'player1' });

        expect(getDetailsSpy).not.toHaveBeenCalled();
    });
});
