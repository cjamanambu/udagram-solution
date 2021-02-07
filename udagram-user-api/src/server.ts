import cors from 'cors';
import express from 'express';
import {sequelize} from './sequelize';
const { v4: uuidv4 } = require('uuid');


import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_USER_MODELS} from './controllers/v0/model.index';


(async () => {
  await sequelize.addModels(V0_USER_MODELS);
  await sequelize.sync();

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(bodyParser.json());

  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: config.url,
  }));

  app.use('/api/v0/', IndexRouter);

  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/api/v0/' );
  } );

  app.get( "/health", async ( req, res ) => {
    let pid = uuidv4();
    console.log( new Date().toLocaleString() + `: ${pid} - Checking feeds database connection...`);
    try {
      await sequelize.authenticate();
      console.log( new Date().toLocaleString() + `: ${pid} - Database Connection has been established successfully`);
      return res.status(200).send({ message: new Date().toLocaleString() + `: ${pid} - Connection has been established successfully.` });
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return res.status(400).send({ message: `Unable to connect to the database: ${error}` });
    }
  });

  // Start the Server
  app.listen( port, () => {
    let pid = uuidv4();
    console.log(new Date().toLocaleString() + `: ${pid} - User Service -`);
    console.log( `server running ${config.url}` );
    console.log( `press CTRL+C to stop server` );
  } );
})();
