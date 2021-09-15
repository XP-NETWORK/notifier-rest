import { createServer } from "http";

import { Server } from "socket.io";
import { ClientEvents, ServerEvents } from "./events";

export function socketMain(): Server<ClientEvents, ServerEvents> {
    const httpServer = createServer();
    const opts = {};

    const io = new Server<ClientEvents, ServerEvents>(httpServer, opts);

    httpServer.listen(3000, () => console.log("Socket is up!"));

    return io;
}