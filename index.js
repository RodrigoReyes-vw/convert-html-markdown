//import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'
const { NodeHtmlMarkdown } = require("node-html-markdown");
const glob = require("glob");
const { promisify } = require("util");
const fs = require("fs");
const fsExtra = require("fs-extra");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ undefined,
  /* customCodeBlockTranslators (optional) */ undefined
);

const fileDirectory = "PATH TO YOU FOLDER with name ConfluencePages";
(async () => {
  try {
    const getDirectories = function (src, ext) {
      return glob.sync(`${src}/**/**/*.${ext}`);
    };

    const allFiles = getDirectories(fileDirectory, "html");

    for (const iterator of allFiles) {
      const data = await readFileAsync(iterator, "utf8");
      console.log("🚀 ~ file: index.js:28 ~ iterator:", iterator)
      const content = nhm.translate(data);
      const localPath = iterator.replace(
        "ConfluencePages",
        "ConfluencePagesMD"
      );

      const dirPath = localPath.split("/");
      dirPath.pop();

      fsExtra.ensureDir(dirPath.join("/"), (err) => {
        console.log("fsExtra.ensureDir ~ err:", err)
      });
      
      writeFileAsync(
        `${localPath.substring(0, localPath.length - 5)}.md`,
        content,
        (err) => {
          if (err) {
            console.error(err);
          }
          console.log("file written successfully");
        }
      ).catch((err) => {
        console.log("writeFileAsync ~ err:", err);
      });
    }
  } catch (err) {
    console.error(err);
  }
})();
