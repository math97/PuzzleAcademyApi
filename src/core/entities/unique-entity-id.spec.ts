import { UniqueEntityId } from './unique-entity-id';

describe('UniqueEntityId', () => {
  it('should be able to create a new unique entity id', () => {
    const uniqueEntityId = new UniqueEntityId();
    expect(uniqueEntityId).toBeTruthy();
    expect(uniqueEntityId.toValue()).toBeDefined();
  });

  it('should be able to create a new unique entity id with a value', () => {
    const value = '123e4567-e89b-12d3-a456-426614174000';
    const uniqueEntityId = new UniqueEntityId(value);
    expect(uniqueEntityId.toValue()).toBe(value);
  });

  it('should be able to compare two unique entity ids', () => {
    const uniqueEntityId1 = new UniqueEntityId();
    const uniqueEntityId2 = new UniqueEntityId();
    expect(uniqueEntityId1.equals(uniqueEntityId2)).toBeFalsy();

    const uniqueEntityId3 = new UniqueEntityId(
      '123e4567-e89b-12d3-a456-426614174000',
    );
    const uniqueEntityId4 = new UniqueEntityId(
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(uniqueEntityId3.equals(uniqueEntityId4)).toBeTruthy();
  });
});
