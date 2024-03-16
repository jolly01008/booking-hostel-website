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

const roomsFileHandler = async (files) => { // 多張圖片files，這邊承接multer處理完的所有檔案
  try {
    if (!files) return null
    // 有多個檔案，用map取出每一筆資料
    const filesPathArray = await Promise.all(files.map(async (file) => { // Promise.all() 来等待所有 Promise 解析
      const fileName = `upload/rooms/${file.originalname}` // fileName被賦值'upload/檔案名稱'。為了最後傳出去的檔名
      const data = await fs.promises.readFile(file.path) // 讀取放在暫存路徑的檔案
      await fs.promises.writeFile(fileName, data)
      return (`/${fileName}`) // 傳出去是一個路徑 '/upload/檔案名稱'
    }))
    return filesPathArray
  } catch (err) {
    return err
  }
}

module.exports = { localFileHandler, roomsFileHandler }
