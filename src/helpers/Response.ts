import { FastifyReply } from 'fastify';

export function response<T>(
  reply: FastifyReply,
  statusCode: number,
  ok: boolean,
  data: T,
  message: string,
) {
  reply.code(statusCode).send({ ok, data, message });
}
