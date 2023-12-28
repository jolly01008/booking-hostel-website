const express = require('express')

const hostelController = {
  getHostels: (req, res) => {
    return res.status(200).json({
      status: 'success',
      message: '測試hostelController'
    })
  }
}

module.exports = hostelController
