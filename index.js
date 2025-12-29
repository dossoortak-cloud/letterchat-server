const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('LetterChat Sunucusu Aktif! 🚀 (v2 - Ringtone Support)');
});

app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).send({ error: 'Token yok' });
  }

  // 🔥 KONTROL: Bu bir arama bildirimi mi?
  // Frontend tarafında (CallScreen.tsx) data içine { type: 'call' } koymuştuk.
  const isCall = data && data.type === 'call';

  const message = {
    to: token,
    title: title,
    body: body,
    data: data || {},
    priority: 'high',
    // 🔥 EĞER ARAMAYSA:
    // 1. Kanal ID'sini 'incoming_call' yap (HomeScreen.tsx ile eşleşmeli)
    // 2. Sesi 'ringtone.mp3' yap (iOS için önemli)
    channelId: isCall ? 'incoming_call' : 'default',
    sound: isCall ? 'ringtone.mp3' : 'default', 
    _displayInForeground: true, // Uygulama açıkken de bildirim düşsün
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
    console.log(`Bildirim Gönderildi (${isCall ? 'ARAMA' : 'MESAJ'}):`, result);
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
