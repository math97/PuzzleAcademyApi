import Bottleneck from 'bottleneck';
import { Injectable } from '@nestjs/common';
import { RateLimiter } from '@/domain/league/application/gateways/rate-limiter';

@Injectable()
export class BottleneckRateLimiter implements RateLimiter {
    private limiter: Bottleneck;

    constructor() {
        const shortLimiter = new Bottleneck({
            minTime: 1000 / 20,
            reservoir: 20,
            reservoirRefreshAmount: 20,
            reservoirRefreshInterval: 1000,
        });

        const longLimiter = new Bottleneck({
            reservoir: 100,
            reservoirRefreshAmount: 100,
            reservoirRefreshInterval: 2 * 60 * 1000,
            minTime: 0,
        });

        shortLimiter.chain(longLimiter);

        this.limiter = shortLimiter;
    }

    async schedule<T>(fn: () => Promise<T>): Promise<T> {
        return this.limiter.schedule(fn);
    }
}
