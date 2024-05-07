//import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'
const { NodeHtmlMarkdown } = require("node-html-markdown");
const cheerio = require("cheerio");

const glob = require("glob");
const { promisify } = require("util");
const fs = require("fs");
const fsExtra = require("fs-extra");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {
    ignore: [
      "head",
      ".header-container-wrapper",
      "footer-container-wrapper",
      `"role="menu"`,
    ],
  },
  /* customTransformers (optional) */ undefined,
  /* customCodeBlockTranslators (optional) */ undefined
);

const getMeta = (content) => {
  const $ = cheerio.load(content);
  const regex =
    /"datePublished" : "(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/;
  const datePublished = regex.exec(content)[1];
  const metaData = `---
author: ${$('meta[name="author"]').attr("content")}
description: ${$('meta[name="description"]').attr("content")}
keywords: ${$('meta[name="keywords"]').attr("content")}
title: ${$('meta[property="og:description"]').attr("content")} 
datePublished: ${datePublished}
---`;
  return metaData;
};

const fileDirectory = "./blog";
(async () => {
  try {
    const getDirectories = function (src, ext) {
      return glob.sync(`${src}/**/**/*.${ext}`);
    };

    const allFiles = getDirectories(fileDirectory, "html");

    for (const iterator of allFiles) {
      const data = await readFileAsync(iterator, "utf8");
      console.log("🚀 ~ file: index.js:28 ~ iterator:", iterator);

      const content = `${getMeta(data)}
${nhm.translate(data)}`;

      const localPath = iterator.replace("blog");

      const dirPath = localPath.split("/");
      dirPath.pop();

      fsExtra.ensureDir(dirPath.join("/md"), (err) => {
        console.log("fsExtra.ensureDir ~ err:", err);
      });

      writeFileAsync(
        `${localPath.substring(0, localPath.length - 5)}.mdx`,
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
