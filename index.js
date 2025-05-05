const {readFile} = require('fs').promises;

async function hello(){
    const file = await readFile('./hello.txt', 'utf8');
}

const myModule = require('./my-module');
console.log(myModule);
