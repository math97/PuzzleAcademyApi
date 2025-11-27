import { Player } from '@/domain/league/enterprise/entities/player';

export abstract class PlayersRepository {
    abstract insert(player: Player): Promise<void>;
    abstract findByPuuid(puuid: string): Promise<Player | null>;
}
