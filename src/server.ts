import app from './app';
import config from './config';
import { connnectDB } from './config/database';

async function main() {
  await connnectDB();
  
  app.listen(config.port, () => {
    console.log(`Server is running in http://localhost:${config.port}`);
  });
}

main();