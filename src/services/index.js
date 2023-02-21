import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const exports = {};

class TestService {}

await (async () => {
    const services = await fs.promises.readdir(join(__dirname, './'));

    await Promise.all(
        services.map((serviceName, i) => {
            if (serviceName != 'index.js' && serviceName != 'auth.js') {
                console.log('serviceName', serviceName);
                return { func: import(`./${serviceName}`), serviceName };
            }
        }),
    ).then(async (func) => {
        for (const s of func) {
            if (s) {
                const service = await s.func;
                const svcName = s.serviceName.split('.')[0];
                // console.log('default', s.default);
                exports[svcName] = service.default;
                TestService.prototype[svcName] = service.default;
            }
        }
    });
})();
const newTesst = new TestService();
console.log('CLASS', newTesst.createAccount);

export default TestService;
