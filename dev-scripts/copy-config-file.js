const fs = require('fs');
const path = require('path');

const source = path.normalize(`${__dirname}/../src/config.json`);
const destination = path.normalize(`${__dirname}/../dist/config.json`);

fs.copyFile(source, destination, (error) => {
    if (error) {
        throw err;
    }
    console.log(`config.json was copied to ${destination}`);
});
