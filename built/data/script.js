'use strict';

const fs = require('fs');
const baseDir = '.';

function getBudgetElements(baseDir, year, type) {
  const tmp = [];
  const dir = `${baseDir}/${year}/${type}`;
  fs.readdirSync(dir).forEach(file => {
    if (fs.lstatSync(`${dir}/${file}`).isFile()) {
      const fileContent = require(`${dir}/${file}`);
      tmp.push(fileContent);
    }
  });
  return tmp;
}

fs.readdirSync(baseDir).forEach(year => {
  if (fs.lstatSync(`${baseDir}/${year}`).isDirectory()) {
    console.log(`Creating "${year}.json" file...`);
    const content = {};
    content.year = +year;
    content.incomes = getBudgetElements(baseDir, year, 'incomes');
    content.spendings = getBudgetElements(baseDir, year, 'spendings');
    fs.writeFileSync(`${baseDir}/${year}/${year}.json`, JSON.stringify(content, null, 2));
    console.log(`"${year}.json" file created.`);
  }
});
