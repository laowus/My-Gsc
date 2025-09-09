const { app } = require("electron");
const path = require("path");
const isDevEnv = process.env["NODE_ENV"] === "dev";

let publicDir = path.join(__dirname, "../../public");
if (!isDevEnv) {
  publicDir = path.join(__dirname, "../../dist");
}
//数据库压缩包
const dbZipPath = path.join(publicDir, "assets/poem.zip");
//数据库文件
const dbDir = path.join(app.getPath("userData"), "database");
const dbPath = path.join(dbDir, "poem.db");
console.log("数据库文件压缩包地址", dbZipPath);
console.log("数据库文件保存地址", dbPath);



module.exports = {
  publicDir,
  dbZipPath,
  dbDir,
  dbPath
};
