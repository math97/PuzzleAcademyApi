export abstract class RateLimiter {
    abstract schedule<T>(fn: () => Promise<T>): Promise<T>;
}
