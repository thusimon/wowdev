import fs from 'fs';

const devBuild = process.argv[2];
const envFile = devBuild === '--dev' ? '.env.local' : '.env';

fs.copyFileSync(`./${envFile}`, './build/.env');
