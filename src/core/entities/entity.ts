import { UniqueEntityId } from './unique-entity-id';

export abstract class Entity<Props> {
    private _id: UniqueEntityId;
    protected props: Props;

    get id() {
        return this._id;
    }

    protected constructor(props: Props, id?: UniqueEntityId) {
        this.props = props;
        this._id = id ?? new UniqueEntityId();
    }

    public equals(entity?: Entity<Props>): boolean {
        if (entity === null || entity === undefined) {
            return false;
        }

        if (this === entity) {
            return true;
        }

        if (!(entity instanceof Entity)) {
            return false;
        }

        return this._id.equals(entity.id);
    }
}
