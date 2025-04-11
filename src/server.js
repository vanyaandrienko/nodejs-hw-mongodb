import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/contacts.js';

export function setupServer() {      

    const PORT = Number(getEnvVar('PORT', '3000'));

    const app = express();

    app.use(express.json());
    
    app.use(
        pino({
          transport: {
            target: 'pino-pretty',
          },
        }),
      );

    app.use(cors());

    app.get('/', (req, res) => {
      res.json({
        message: 'Hello World!',
      });
    });
    
    app.use(router); 
   
    app.use('*', notFoundHandler);

    app.use(errorHandler);
  
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });
};