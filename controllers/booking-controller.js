const { Room, Hostel, Booking, Landlord, Bed, bookedBed } = require('../models')
const authHelper = require('../helpers/auth-helpers')
const filterHelper = require('../helpers/filterRooms-helpers')
const filterBedsAmount = require('../helpers/filterBeds-helpers').bedsAmountFilter
const createBed = require('../helpers/filterBeds-helpers').bedCreater

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const bookingController = {
  searchRooms: async (req, res, next) => {
    try {
      const { keyword, checkin, checkout, adults, kids } = req.query
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      if (!keyword) throw new Error('請輸入想搜尋的地點')
      if (!checkin || !checkout) throw new Error('請輸入想入住的時間')
      if (checkin > checkout) throw new Error('請輸入合理的時間，入住日期不可比退房日期還晚')
      if (checkin === checkout) throw new Error('請輸入合理的時間，入住日期與退房日期，不可為同一天')
      if (checkin < today || checkout < today) throw new Error('請輸入合理的時間，只能預約未來的時間')
      if (adults < 1) throw new Error('請確實填寫人數，至少須有一位成人')

      // 關鍵字搜尋，所有房間==========================

      const keywordResults = await filterHelper.keywordFilter(keyword, next)

      if (keywordResults.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: '找不到符合條件的資料'
        })
      }

      // 日期(判斷是否已被預約過)、人數篩選搜尋================================
      const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
      const dateNotAllowResults = await filterHelper.dateFilter(checkin, checkout, adults, kids, next)
      // keywordResults"關鍵字搜尋"的結果，要去除掉dateNotAllowResult "日期重疊或床位不足" 的結果
      //  some() 方法的调用，用于检查 dateNotAllowResults 数组中是否至少存在一个元素的 id 属性與 keywordResult 数组中当前元素的 id 属性相同
      //  数组中找不到任何一个元素的 id 属性與當前 keywordResult 数组中的元素的 id 属性相同，那么 ! 反向變成 true，就會保留在results的結果
      const results = keywordResults.filter(keywordResult =>
        !dateNotAllowResults.some(dateNotAllowResult => dateNotAllowResult.Room.id === keywordResult.id))

      if (results.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: '這段期間已經沒有可預約的房間'
        })
      }

      return res.status(200).json({
        searchData: req.query,
        message: `建議床位數至少: ${suggestBeds} 張床`,
        results
      })
    } catch (err) {
      next(err)
    }
  },
  getBookingRoom: async (req, res, next) => {
    try {
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      // req.query 可以用于获取 URL 中查询字符串中的参数，但是它不仅限于查询字符串，也可以用于获取通过 GET 请求传递的参数
      const { checkin, checkout } = req.query // 由前端從localStorage讀資料並傳送到後端

      if (checkin > checkout) throw new Error('日期不合理，入住日期不可比退房日期還晚')
      if (checkin === checkout) throw new Error('日期不合理，入住日期與退房日期，不可為同一天')
      if (checkin < today || checkout < today) throw new Error('日期不合理，只能預約未來的時間')

      const { hostelId, roomId } = req.params
      const room = await Room.findByPk(roomId, {
        attributes: ['id', 'title', 'type', 'description', 'price', 'headcount', 'facilities']
      })
      const hostel = await Hostel.findByPk(hostelId, {
        attributes: ['id', 'name', 'address', 'description', 'picture'],
        include: [{
          model: Landlord,
          attributes: ['name', 'phone', 'avatar']
        }]
      })
      const daysOfStay = dayjs(checkout).diff(dayjs(checkin), 'day') // 住宿天數
      const totalPrice = daysOfStay * room.price // 總價是 天數 * 一晚價格

      return res.status(200).json({
        roomData: room,
        hostelData: hostel,
        totalPrice
      })
    } catch (err) {
      next(err)
    }
  },
  postBookingRoom: async (req, res, next) => {
    try {
      const currentUserId = authHelper.getUser(req).id
      const { checkin, checkout, adults, kids } = req.body // 由前端從localStorage讀資料並傳送到後端
      const { tenantName, email, phone } = req.body
      const { roomId } = req.params
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      if (!checkin || !checkout) throw new Error('想住宿的日期尚未填妥')
      if (!adults || !kids) throw new Error('訂房人數尚未填妥')
      if (!tenantName || !email || !phone) throw new Error('訂房資料請填寫完整')
      if (checkin > checkout || checkin < today || checkout < today) throw new Error('請輸入合理的時間')
      if (!adults > 1) throw new Error('請確實填寫人數，至少須有一位青年或成人')

      // const dateNotAllowResults = await filterHelper.dateFilter(checkin, checkout, adults, kids, next)
      // // 這些輸入的條件，若 dateNotAllowResults 有一筆資料，代表該期間已無可預約的房間
      // console.log('===============dateNotAllowResults:', dateNotAllowResults)
      // if (dateNotAllowResults.length > 0) {
      //   return res.status(200).json({
      //     status: 'success',
      //     message: '這段期間已經沒有能滿足該條件、可預約的房間'
      //   })
      // }

      const room = await Room.findByPk(roomId, {
        attributes: ['id', 'price', 'type'],
        include: {
          model: Bed,
          attributes: ['id']
        }
      })
      const daysOfStay = dayjs(checkout).diff(dayjs(checkin), 'day') // 住宿天數
      const totalPrice = daysOfStay * room.price // 總價是 天數 * 一晚價格

      // 確認相同條件是否已預約過
      const alreadyBooked = await Booking.findOne({
        where: {
          tenantName,
          email,
          phone,
          bookingDate: new Date(checkin),
          checkoutDate: new Date(checkout),
          numberOfAdults: adults,
          numberOfKids: kids,
          totalPrice,
          userId: currentUserId,
          roomId
        }
      })
      if (alreadyBooked) throw new Error(`${tenantName}，您已預約${checkin} ~ ${checkout} 期間，入住該房間，請勿重複預約。`)

      if (room.type === 'private_room') {
        const dateNotAllowResults = await filterHelper.dateFilter(checkin, checkout, adults, kids, next)
        // 這些輸入的條件，若 dateNotAllowResults 有一筆資料，代表該期間已無可預約的房間
        if (dateNotAllowResults.length > 0) {
          return res.status(200).json({
            status: 'success',
            message: '這段期間已經沒有能滿足該條件、可預約的房間'
          })
        }

        await Booking.create({
          tenantName,
          email,
          phone,
          bookingDate: checkin,
          checkoutDate: checkout,
          numberOfAdults: adults,
          numberOfKids: kids,
          totalPrice,
          userId: currentUserId,
          roomId: room.id
        })
      }

      // 若登記的房間是混合房，也需存床位、訂單資料到Booked_bed資料表
      // 1.先確定該混合房床位數量還夠 2.Booking表寫進資料 3.Booked_bed表寫進資料
      if (room.type === 'mixed_dorm') {
        const result = await filterBedsAmount(checkin, checkout, adults, kids, roomId, next)
        if (result === '這個期間，該房間的床位不足!') {
          res.json({
            status: 'warning',
            message: '這個期間，該房間的床位不足!',
          })
        }
        if (result === '床位還足夠') {
          await Booking.create({
            tenantName,
            email,
            phone,
            bookingDate: checkin,
            checkoutDate: checkout,
            numberOfAdults: adults,
            numberOfKids: kids,
            totalPrice,
            userId: currentUserId,
            roomId: room.id
          })
        } else {
          res.json({
            status: 'error',
            message: '預約房間時出了一些錯誤'
          })
        }

        const bedCreaterResult = await createBed(tenantName, email, phone, checkin, checkout, adults, kids, totalPrice, currentUserId, roomId, next)
        if (!bedCreaterResult.bookingId && !bedCreaterResult.bedRecords) throw new Error('這個期間，該房間床位不足!')
        await bookedBed.create({
          bookingId: bedCreaterResult.bookingId,
          bedRecords: JSON.stringify(bedCreaterResult.bedRecords)
        })
      }

      return res.status(200).json({
        status: 'success',
        message: '預約成功!',
        data: req.body
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = bookingController
