// 將檔案從暫存區複製一份到可公開的uplpad資料夾
const fs = require('fs')
const localFileHandler = file => { // file是multer處理完的檔案
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const fileName = `upload/${file.originalname}` // fileName被賦值'upload/檔案名稱'。為了最後傳出去的檔名
    return fs.promises.readFile(file.path) // 讀取放在暫存路徑的檔案
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`)) // 傳出去是一個路徑 '/upload/檔案名稱'
      .catch(err => reject(err))
  })
}

module.exports = { localFileHandler }