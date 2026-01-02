const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('LetterChat Sunucusu Aktif! 🚀 (v3 - GPS Support)');
});

app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).send({ error: 'Token yok' });
  }

  const isCall = data && data.type === 'call';
  const isFindPhone = data && data.type === 'find_phone';

  // 🔥 KANAL SEÇİMİ
  let channelId = 'default';
  let sound = 'default';

  if (isCall) {
      channelId = 'incoming_call';
      sound = 'ringtone.mp3';
  } 
  
  if (isFindPhone) {
      channelId = 'incoming_call'; // Aramayla aynı kanalı kullan (Maksimum ses için)
      sound = 'ringtone.mp3';
  }

  const message = {
    to: token,
    title: title,
    body: body,
    data: data || {},
    priority: 'high',
    channelId: channelId,
    sound: sound,
    _displayInForeground: true,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log(`Bildirim Gönderildi (${isFindPhone ? 'GPS' : isCall ? 'ARAMA' : 'MESAJ'}):`, result);
    res.status(200).send(result);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
