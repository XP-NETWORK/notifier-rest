import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import * as socket from './socket';
import { scrypt_verify } from './scrypt';
import { port, secret_hash } from './config';
import http from "http";

const app = express();
const server = http.createServer(app);
const io = socket.socketMain(server);

console.log("WARN: using permissive cors!!")

app.use(cors({ origin: '*' }))
app.use(express.json())

type AlgorandMintReq = {
    action_id: number;
    chain_nonce: number;
    target_address: string;
    transaction_fees: string;
    nft_url: string;
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header("Authorization");
    if (!auth) {
        return res.status(403).send({ "status": "err" });
    }

    try {
        if (await scrypt_verify(auth, secret_hash)) {
            return next();
        }
    } catch (e) {
        console.log(e)
    }

    return res.status(403).send({ "status": "err" });
}

app.post('/tx/tron', (req, res) => {
    io.emit("tron:bridge_tx", req.body.tx_hash);
    res.send('{"status": "ok"}')
});

app.post('/tx/algorand', requireAuth, (req: Request<{}, {}, AlgorandMintReq>, res) => {
    io.emit(
        "algorand:bridge_tx",
        req.body.action_id.toString(),
        req.body.chain_nonce,
        req.body.target_address,
        req.body.transaction_fees,
        req.body.nft_url
    );

    res.send({ "status": "ok" });
});


server.listen(port, () => console.log(`Server is up on port ${port}!`))
