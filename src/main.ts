import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import * as socket from './socket';
import { scrypt_verify } from './scrypt';
import { port, secret_hash } from './config';
import http from "http";
import { MikroORM, RequestContext } from '@mikro-orm/core';
import mikroConf from './mikro-orm';
import { EntityManager, MongoDriver } from '@mikro-orm/mongodb';
import { TxStore } from './db/TxStore';

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

async function emitEvent(em: EntityManager, chainId: number, txHash: string, cb: (chain: number, txHash: string) => void): Promise<"err" | "ok"> {
    const ent = await em.findOne(TxStore, { chainId, txHash });
    if (ent != null) return "err";

    cb(chainId, txHash);

    return "ok";
}

async function main() {
    const orm: MikroORM<MongoDriver> = await MikroORM.init(mikroConf);

    app.use((_, __, next) => {
        RequestContext.create(orm.em, next);
    });

    app.post('/tx/tron', async (req, res) => {
        const status = await emitEvent(
            orm.em,
            9,
            req.body.tx_hash,
            (_, txHash) => io.emit("tron:bridge_tx", txHash)
        )
        res.json({ status });
    });

    app.post('/tx/web3', async (req, res) => {
        const status = await emitEvent(
            orm.em,
            req.body.chain_nonce,
            req.body.tx_hash,
            (chain, hash) => io.emit("web3:bridge_tx", chain, hash)
        );
        res.json({ status });
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
}

main().catch(console.dir);