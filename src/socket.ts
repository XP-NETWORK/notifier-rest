import http from 'http';

import { Server } from 'socket.io';
import { ClientEvents, ServerEvents } from './events';

export function socketMain(
  server: http.Server
): Server<ClientEvents, ServerEvents> {
  const socketPath: string | undefined = process.env.SOCKET_PATH;

  const opts = {
    cors: {
      origin: '*',
    },
    ...(socketPath ? { path: socketPath } : {}),
  };
  console.log(opts);
  const io = new Server<ClientEvents, ServerEvents>(server, opts);

  return io;
}
