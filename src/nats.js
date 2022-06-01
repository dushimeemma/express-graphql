import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connect, StringCodec } from 'nats';
import moment from 'moment';

config();

const { PORT } = process.env;

const port = PORT || 3000;

const app = express();

app.use(cors());

const connectNats = async () => {
  const nc = await connect({ servers: 'demo.nats.io:4222' });
  const sc = StringCodec();
  const sub = nc.subscribe(moment().format());
  (async () => {
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    }
    console.log('subscription closed');
  })();

  nc.publish(moment().format(), sc.encode(moment().format()));
  nc.publish(moment().format(), sc.encode(moment().format()));

  await nc.drain();
};

connectNats();

app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;
