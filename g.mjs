import {mkdirSync, readdirSync} from 'fs';
import {readFileSync, writeFileSync} from "node:fs";

let utilsContent = '';
function generateIndexForFolder(folderPath, jsContent = '', tsContent = ''){
    // let jsContent = '', tsContent = '';
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
            jsContent += `export * from './${fileWithoutExtension}';\n`;
            tsContent += `export * from './${fileWithoutExtension}';\n`;
            if(folderPath.includes('/Components')){
                let folder = folderPath.split('/Components')[1];
                if(folder.startsWith('/')){
                    folder = folder.slice(1);
                }
                utilsContent += `export * from '../Components/${folder}/${fileWithoutExtension}';\n`;
            }
        // }else if(file.endsWith('.js')){
        //     content += `export * from './${file}';\n`;
        }else if(file.endsWith('.vue')){
            jsContent += `export { default as ${fileWithoutExtension} } from './${file}';\n`;
            tsContent += `export { default as ${fileWithoutExtension} } from './${file}';\n`;
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
        jsContent += `export * from './${dir}';\n`;
        tsContent += `export * from './${dir}';\n`;
    }
    if(jsContent.trim()){
        // rmSync(`${folderPath}/index.js`, content);
        writeFileSync(`${folderPath}/index.js`, jsContent);
        writeFileSync(`${folderPath}/index.ts`, tsContent);
        writeFileSync(`${folderPath}/index.d.ts`, 'export * from "./index";');
    }

    return jsContent.trim();
}

generateIndexForFolder('./lib/Components')
generateIndexForFolder('./lib/utils', utilsContent, utilsContent)


// function moveIndexToDist(folder, ext){
//     let content = readFileSync(`./lib/${folder}/index.${ext}`, 'utf8');
//
//     // replace all from './ to '../Components/
//
//     content = content.replaceAll('\'./', `'../lib/${folder}/`)
//     writeFileSync(`./disto/${folder.toLowerCase()}.${ext}`, content);
//
//     if(ext === 'ts'){
//         writeFileSync(`./disto/${folder.toLowerCase()}.d.${ext}`, content);
//     }
// }
//
//
// mkdirSync('./disto', {recursive: true});
// moveIndexToDist('Components', 'js')
// moveIndexToDist('Components', 'ts')
// moveIndexToDist('utils', 'js')
// moveIndexToDist('utils', 'ts')
// // writeFileSync(`./dist/index.d.ts`, `
// //     declare module "arg-vue" {
// //         export * from "arg-vue/dist/components";
// //     }
// //     declare module "arg-vue/utils" {
// //         export * from "arg-vue/dist/utils";
// //     }
// // `);


console.log('Index files generated')
console.log()