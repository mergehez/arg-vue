// increment version number in package.json


import * as fs from "node:fs";

const content = fs.readFileSync('./package.json', 'utf-8');

const packageJson = JSON.parse(content);
const oldVersion = packageJson.version;

const version = packageJson.version.split('.');
const patch = parseInt(version[2]) + 1;
version[2] = patch.toString();
packageJson.version = version.join('.');

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

console.log(`Update package version from ${oldVersion} to ${packageJson.version}`);
console.log()
