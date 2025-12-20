import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { MatchParticipant } from './match-participant';

export interface MatchProps {
    riotMatchId: string;
    gameCreation: Date;
    gameDuration: number;
    gameMode: string;
    participants: MatchParticipant[];
}

export class Match extends Entity<MatchProps> {
    get riotMatchId() {
        return this.props.riotMatchId;
    }

    get gameCreation() {
        return this.props.gameCreation;
    }

    get gameDuration() {
        return this.props.gameDuration;
    }

    get gameMode() {
        return this.props.gameMode;
    }

    get participants() {
        return this.props.participants;
    }

    static create(props: MatchProps, id?: UniqueEntityId) {
        const match = new Match(props, id);
        return match;
    }
}
