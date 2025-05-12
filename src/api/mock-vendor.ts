import express from 'express';
const router = express.Router();

router.post('/mock-vendor', (req, res) => {
  const isSuccess = Math.random() < 0.9; // 90% success rate
  setTimeout(() => {
    res.status(200 ).json({
      success: isSuccess,
      messageId: require('crypto').randomBytes(16).toString('hex')
    });
  }, 100 + Math.random() * 400); // Simulate latency
});

export default router;