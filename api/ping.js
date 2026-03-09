// api/ping.js - 超简单的测试接口

module.exports = async (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Pong! 🏓',
    timestamp: new Date().toISOString()
  });
};
