const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();


router.get('/quiz/:id/qrcode', async (req, res) => {
  const quizId = req.params.id;
  const quizLink = `http://localhost:8081/quiz/${quizId}`;

  try {
    const qrCodeDataURL = await QRCode.toDataURL(quizLink);
    res.status(200).json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate QR Code' });
  }
});

module.exports = router;