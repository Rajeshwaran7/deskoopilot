import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { getConfig } from './config/env.js';

const config = getConfig();

await connectDatabase();

app.listen(config.PORT, () => {
  console.log(`Compliance Copilot backend listening on http://localhost:${config.PORT}`);
});
