import { setupServer } from 'msw/node';

/** Mock API; tests register handlers per scenario with server.use(...). */
const server = setupServer();

export default server;
