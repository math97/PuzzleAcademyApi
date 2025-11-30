import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface PlayerProps {
    name: string;
    tag: string;
    riotPuiid: string;
    tier?: string | null;
    rank?: string | null;
    leaguePoints?: number | null;
    profileIconId?: number | null;
    summonerLevel?: number | null;
}

export class Player extends Entity<PlayerProps> {
    get name() {
        return this.props.name;
    }

    get tag() {
        return this.props.tag;
    }

    get riotPuiid() {
        return this.props.riotPuiid;
    }

    get tier() {
        return this.props.tier;
    }

    get rank() {
        return this.props.rank;
    }

    get leaguePoints() {
        return this.props.leaguePoints;
    }

    get profileIconId() {
        return this.props.profileIconId;
    }

    get summonerLevel() {
        return this.props.summonerLevel;
    }

    static create(
        props: Optional<PlayerProps, 'tier' | 'rank' | 'leaguePoints' | 'profileIconId' | 'summonerLevel'>,
        id?: UniqueEntityId,
    ) {
        const player = new Player(
            {
                ...props,
                tier: props.tier ?? null,
                rank: props.rank ?? null,
                leaguePoints: props.leaguePoints ?? null,
                profileIconId: props.profileIconId ?? null,
                summonerLevel: props.summonerLevel ?? null,
            },
            id,
        );

        return player;
    }

    updateDetails(details: { profileIconId: number; summonerLevel: number }) {
        this.props.profileIconId = details.profileIconId;
        this.props.summonerLevel = details.summonerLevel;
    }
}
