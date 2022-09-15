import http from 'http';

import { Server } from 'socket.io';
import { ClientEvents, ServerEvents } from './events';

export function socketMain(
  server: http.Server
): Server<ClientEvents, ServerEvents> {
  const opts = {
    cors: {
      origin: '*',
    },
  };

  const io = new Server<ClientEvents, ServerEvents>(server, opts);

  return io;
}
