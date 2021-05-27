// const fs = require('fs');
const path = require('path');
const send = require('koa-send');
module.exports = router => {
    const distPath = path.dirname(require.resolve('san-devtools/dist/'));

    router.get('/san-devtools/(.+)', async ctx => {
        const relativePath = ctx.params[0];
        // fs.createReadStream(`${distPath}`)
        try {
            await send(ctx, relativePath, {
                maxage: 60 * 60 * 2 * 1e3,
                root: distPath
            });
        } catch (err) {
            if (err.status !== 404) {
                throw err;
            }
        }
    });
};
