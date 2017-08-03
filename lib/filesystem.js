'use strict';
const fs = require('fs');
const {
    resolve,
    basename,
    extname,
    dirname
} = require('path');

/**
 * 遍历该文件夹，获取所有文件。
 *
 * @param {String} dirname 文件夹路径
 * @param {Object} options 选项
 *          {Boolean} recursive 是否递归
 *          {Function} filter 过滤函数
 * @return {[String]}         文件路径的数组
 */

const readdir = (dir, { recursive = true, filter = () => true } = {}) => {
  return fs
          .readdirSync(dir)
          .map(filename => {
            const filePath = resolve(dir, filename);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              if(dirname(filePath).endsWith('node_modules')) {
                return [filePath];
              }
              return recursive? readdir(filePath) : [];
            }
            else if (stat.isFile())
              return [filePath];
          })
          .reduce((files, e) => [...files, ...e], [])
          .filter(filter);
};

module.exports = {
  readdir
};
