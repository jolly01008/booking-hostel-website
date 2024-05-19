// 將檔案從暫存區複製一份到可公開的uplpad資料夾
const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

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

// 傳送單一張圖片。用第三方網站imgur儲存圖片
const imgurFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    return imgur.uploadFile(file.path) // 把暫存路徑的檔案 uplaadFile(上傳)
      .then(img => {
        resolve(img?.link || null) // 檢查 被上傳的img 是否存在
      })
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

// 傳送單多張圖片。用第三方網站imgur儲存圖片
const imgurFilesHandler = async (files) => {
  try {
    if (!files || files.length === 0) return null
    // 有多個檔案，用map取出每一筆資料
    const filesPathArray = await Promise.all(files.map(async (file) => { // Promise.all() 来等待所有 Promise 解析
      const img = await imgur.uploadFile(file.path) // 把暫存路徑的檔案 uplaadFile(上傳)。並獲取返回值
      return img?.link || null // 檢查 img.link 是否存在
    }))
    return filesPathArray
  } catch (err) {
    console.error('Error uploading files to Imgur:', err) // 更詳細的錯誤訊息
    return err
  }
}

module.exports = { localFileHandler, roomsFileHandler, imgurFileHandler, imgurFilesHandler }
