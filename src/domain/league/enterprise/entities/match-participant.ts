import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export interface MatchParticipantProps {
    puuid: string;
    summonerName: string;
    championName: string;
    kills: number;
    deaths: number;
    assists: number;
    win: boolean;
    totalDamageDealt: number;
    visionScore: number;
}

export class MatchParticipant extends Entity<MatchParticipantProps> {
    get puuid() {
        return this.props.puuid;
    }

    get summonerName() {
        return this.props.summonerName;
    }

    get championName() {
        return this.props.championName;
    }

    get kills() {
        return this.props.kills;
    }

    get deaths() {
        return this.props.deaths;
    }

    get assists() {
        return this.props.assists;
    }

    get win() {
        return this.props.win;
    }

    get totalDamageDealt() {
        return this.props.totalDamageDealt;
    }

    get visionScore() {
        return this.props.visionScore;
    }

    static create(props: MatchParticipantProps, id?: UniqueEntityId) {
        const participant = new MatchParticipant(props, id);
        return participant;
    }
}
