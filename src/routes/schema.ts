import z from 'zod/v4';

export const schema = z.object({
	destination: z.url('The destination must be a valid URL'),
	slug: z.string().max(255, 'Slugs can not exceed 255 characters.').default('')
});
