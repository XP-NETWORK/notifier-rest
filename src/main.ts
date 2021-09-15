import express from 'express';
import cors from 'cors';
import * as socket from './socket';

const port = 6644;

const app = express();
const io = socket.socketMain();

console.log("WARN: using permissive cors!!")

app.use(cors({origin: '*'}))
app.use(express.json())

app.post('/tx/tron', (req, res) => {
    io.emit("tron:bridge_tx", req.body.tx_hash);
    res.send('{"status": "ok"}')
});

app.listen(port, () => console.log("Express Server is up!"))
