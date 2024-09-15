#!/usr/bin/env node

// cli/install.ts
import path from "path";
import fs from "node:fs";
console.log(fs.readdirSync("./"));
fs.mkdirSync("./resources/sass", { recursive: true });
fs.writeFileSync("./resources/sass/app.scss", fs.readFileSync(path.resolve(__dirname, "stubs/app.scss.stub")));
fs.writeFileSync("./resources/sass/components.scss", fs.readFileSync(path.resolve(__dirname, "stubs/components.scss.stub")));
fs.writeFileSync("./resources/sass/colors.scss", fs.readFileSync(path.resolve(__dirname, "stubs/colors.scss.stub")));
