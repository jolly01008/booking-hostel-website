# 旅館訂房網站 hostel-booking-web

![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image01.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image02.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image03.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image04.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image05.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image06.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image07.png)
![image](https://github.com/jolly01008/booking-hostel-website/blob/main/public/readmeImage/image08.png)

## 環境框架與架構設計

處理整體商業邏輯，資料庫設計與溝通的後端部分。  
包含身分驗證、角色權限、篩選可預約日期、創建、刪除資料、預約房間..等等的訂房核心功能。  
資料庫符合正規化和 ACID 特性，實現一對一、一對多、多對多之關聯資料。  
操作資料庫，運用 JavaScript 的 async/await 處理異步操作，減少 callback hell。

採用 MVC 架構，以 Node.js 及 express 框架製作，搭配 MySQL 關聯式資料庫，  
提供符合 RESTful 規範的 Web API，執行 CRUD 操作。供前端調用。

## 專案介紹

這是一個可提供旅遊客、背包客預約訂房的網站。  
也讓擁有房源的房東，能在平台上創建並管理自己的旅館與房間。

- 一般使用者身分  
  查看、編輯個人資料，瀏覽所有旅館與房間。  
  藉由輸入想要的條件(關鍵字、入住日期、人數)篩選人數足夠的房間，讓使用者進行預約。  
  預約完成，可瀏覽新、舊的訂房紀錄。  
  若有房源，想提供住宿，可申請成房東身分，切換身分。

- 房東身分  
  需從一般使用者身分，填寫表單申請，才得到房東權限。可切換回使用者身分。  
  房東個人頁面，瀏覽來自使用者的訂房紀錄。  
  能創建多家旅館、多個房間;編輯旅館、編輯/刪除房間。  
  為了讓房東方便分類，房間分成獨立套房、混合住宿。  
  若房客預約的是混合房，會分配床位。

## 功能

- 未登入

  - 一般使用者可以註冊及登入帳號

- 登入後

  - 一般使用者身分

    - 在首頁瀏覽所有旅館，各家旅館以各自最低的房間價格，顯示起價
    - 瀏覽單一旅館資訊
    - 瀏覽單一房間資訊
    - 使用條件搜尋列，輸入關鍵字、日期、訂房人數(分成大人、孩童)等條件，搜尋適合的房間
    - 透過輸入條件搜尋房間，並進行預約
    - 瀏覽個人資訊
    - 編輯個人資訊
    - 瀏覽未來、過去的訂房紀錄，包括住宿日期、總金額、混合房床位(多對多)
    - 填寫表單申請變成房東身分
    - 切換成房東身分
    - 使用者登出

  - 房東身分

    - 可創建多家旅館
    - 在特定旅館中，可創建多個房間。房間分為獨立套房、混合房型
    - 瀏覽自己創建的所有旅館、單一旅館資訊
    - 編輯單一旅館資訊
    - 瀏覽自己創建的所有房間、單一房間資訊
    - 編輯單一房間資訊
    - 刪除單一房間
    - 瀏覽個人的房東資訊
    - 編輯個人的房東資訊
    - 瀏覽未來、過去來自使用者的訂房紀錄，包括租客姓名、電話、預約日期
    - 切換成一般使用者身分

## 共用帳號

- 第一組 user 帳號 (只有一般使用者身分)

  - email: user1@example.com
  - password: 12345678

- 第二組 user 帳號 (已申請好房東身分)

  - email: user2@example.com
  - password: 12345678

# 安裝及使用

## 本地基礎設置

確認本地端已安裝 Node.js 、 npm 、 MySQL Workbenchh

## 資料庫連線設定

1. 打開 MySQL Workbench。

2. 在首頁點擊 "MySQL Connections" 中的 + 按鈕來添加新連接。

3. 填寫連接名稱和以下參數：

- 伺服器位址（Host）：例如 localhost 或其他遠端 IP。
- 埠號（Port）：默認為 3306。
- 使用者名稱（Username）：例如 root。
- 密碼（Password）：填寫對應使用者的密碼。

4. 初始化、建立一個新的 MySQL 資料庫，可參考以下指令。

```
drop database if exists hostel;
create database hostel;
use hostel
```

注意此段 drop database if exists hostel 指令。
如果存在名為 hostel 的資料庫，會刪除 hostel 資料庫中的所有資料，
可自行更換名稱，或請確認在資料備份無虞的情況下執行。

## 開始使用

1. 將專案 clone 到本地

2. 開啟終端機(Terminal)，進入存放此專案的資料夾

```

cd booking-hostel-website

```

3. 安裝所需套件

```

npm install

```

4. 設置.env 檔

```

請修改 `.env.example` 成 .env，並設定相關參數

```

5. 匯入種子檔案

```

npm run seed

```

6. 啟動伺服器，執行 app.js 檔案

```

npm run dev

```

7. 當 terminal 出現類似以下字樣，表示伺服器已啟動

> App is running on http://localhost:3001

8. 可搭配以下前端網址，用瀏覽器操作畫面

<https://github.com/jolly01008/booking-hostel-website-frontend>

## 開發工具

包含以下但不限於

- Node.js 14.16.0
- nodemon
- bcryptjs 2.4.3
- Express 4.18.2
- cors 2.8.5
- express-session 1.17.3
- jsonwebtoken 8.5.1
- faker 5.5.3
- imgur 1.0.2
- dotenv 16.3.1
- method-override 3.0.0
- multer 1.4.3
- mysql2 2.1.0
- passport 0.4.1
- passport-jwt 4.0.0
- passport-local 1.0.0
- dayjs 1.11.10
- sequelize 5.21.13
- sequelize-cli 6.2.0
  其餘詳見檔案 package.json
