// faqsRouter.js
const express = require('express');
const router = express.Router();
const connection = require('../database/db'); // 导入你的数据库连接模块

// 处理 /getfaqsList 路径的 GET 请求
router.get('/getfaqsList', (req, res) => {
    connection.query('SELECT * FROM faqs', (error, results, fields) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(results); // 返回从数据库中获取的数据
        }
    });
});

module.exports = router;

