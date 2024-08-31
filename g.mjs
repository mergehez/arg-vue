
import { readdirSync } from 'fs';
import {readFileSync, rm, rmSync, writeFileSync} from "node:fs";

function generateIndexForFolder(folderPath) {
    let content = '';
    const files = readdirSync(folderPath);
    const hasGInclude = files.includes('.g-include');
    const allowedFiles = !hasGInclude
        ? files
        : readFileSync(`${folderPath}/.g-include`, 'utf8')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '.g-include' && files.includes(line));

    for (const file of allowedFiles) {
        if(file === 'index.ts' || file === 'index.js'){
            continue;
        }

        const fileWithoutExtension = file.split('.').slice(0, -1).join('.');

        if(file.endsWith('.ts') && (file === 'app.d.ts' || !file.endsWith('.d.ts'))){
            content += `export * from './${fileWithoutExtension}';\n`;
        // }else if(file.endsWith('.js')){
        //     content += `export * from './${file}';\n`;
        }else if(file.endsWith('.vue')){
            content += `export { default as ${fileWithoutExtension} } from './${file}';\n`;
        }
    }


    const dirs = readdirSync(folderPath, {
        withFileTypes: true,
    }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

    for (const dir of dirs) {
        const dirContent = generateIndexForFolder(`${folderPath}/${dir}`);
        if(dirContent.trim() === ''){
            continue;
        }
        content += `export * from './${dir}';\n`;
    }
    if(content.trim()){
        // rmSync(`${folderPath}/index.js`, content);
        writeFileSync(`${folderPath}/index.js`, content);
        writeFileSync(`${folderPath}/index.ts`, content);
        writeFileSync(`${folderPath}/index.d.ts`, 'export * from "./index";');
    }

    return content.trim();
}

generateIndexForFolder('./lib')

console.log('Index files generated')
console.log()