import { BentoCache, bentostore } from 'bentocache';
import { memoryDriver } from 'bentocache/drivers/memory';
import { redisDriver } from 'bentocache/drivers/redis';
import { env } from '$env/dynamic/private';
import Redis from 'ioredis';

const cacheRedis = new Redis(env.PRIVATE_REDIS_URL, { lazyConnect: true });

export const cache = new BentoCache({
	default: 'multitier',
	ttl: '1h',
	grace: '6h',
	stores: {
		multitier: bentostore()
			.useL1Layer(memoryDriver({ maxSize: '20mb' }))
			.useL2Layer(redisDriver({ connection: cacheRedis }))
	}
});
