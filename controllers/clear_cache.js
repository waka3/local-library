const fs = require('fs');
const path = require('path');
// 清除缓存文件
exports.BookDetailCache = (req, res) => {
  let id = req.query.id || 0;
  let targetPath;
  // 如果参数为all，清除book文件夹下所有的书本详情页缓存，否则按id删除对应的书本详情页
  if (id != 'all'){
    targetPath = path.join(__dirname,'..','/static/book/',`${id}.html`);
    fs.access(targetPath,(error) => {
      if (!error) {
        fs.unlink(targetPath, (error) => {
          if (!error) {
            res.json({
              success: true,
              result: '操作成功'
            });
          } else {
            res.json({
              success: false,
              result: '操作失败'
            });
          }
        });
      }else {
        res.json({
          success: false,
          result: '没有缓存文件'
        });
      }
    });
  }else {
    targetPath = path.join(__dirname,'..','/static/book/');
    fs.access(targetPath,(error) => {
      if (!error) {
        let dirList = fs.readdirSync(targetPath);
        dirList.forEach((fileName) => {
          fs.unlinkSync(targetPath + fileName);
        });
        res.json({
          success: true,
          result: '操作成功'
        });
      }else {
        res.json({
          success: false,
          result: '没有缓存文件'
        });
      }
    });
  }
};