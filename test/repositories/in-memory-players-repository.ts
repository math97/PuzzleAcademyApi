import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { Player } from '@/domain/league/enterprise/entities/player';

export class InMemoryPlayersRepository implements PlayersRepository {
    public items: Player[] = [];

    async insert(player: Player): Promise<void> {
        this.items.push(player);
    }

    async findByPuuid(puuid: string): Promise<Player | null> {
        const player = this.items.find((item) => item.riotPuiid === puuid);

        if (!player) {
            return null;
        }

        return player;
    }

    async save(player: Player): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id === player.id);

        this.items[itemIndex] = player;
    }

    async findByNameAndTag(name: string, tag: string): Promise<Player | null> {
        const player = this.items.find((item) => item.name === name && item.tag === tag);

        if (!player) {
            return null;
        }

        return player;
    }
}
