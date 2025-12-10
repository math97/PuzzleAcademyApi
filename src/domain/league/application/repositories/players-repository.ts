import { Player } from '@/domain/league/enterprise/entities/player';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { PaginatedResult } from '@/core/repositories/paginated-result';

export abstract class PlayersRepository {
  abstract insert(player: Player): Promise<void>;
  abstract save(player: Player): Promise<void>;
  abstract findByPuuid(puuid: string): Promise<Player | null>;
  abstract findById(id: string): Promise<Player | null>;
  abstract findByNameAndTag(name: string, tag: string): Promise<Player | null>;
  abstract findAll(params: PaginationParams): Promise<PaginatedResult<Player>>;
  abstract findAllIds(): Promise<string[]>;
}
