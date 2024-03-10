const multer = require('multer')
const upload = multer({ dest: 'temp/' }) // multer套件，將使用者上傳的圖片臨時暫存到temp。賦值在upload變數中
module.exports = upload // 可將upload 中間件應用到路由中，處理文件上傳
