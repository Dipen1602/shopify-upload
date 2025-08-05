const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static('uploads'));

app.post('/profile_upload', upload.single('file'), async (req, res) => {
  const customerid = req.body.customerid;
  if (!req.file) return res.status(400).send('No file uploaded.');
  const fileUrl = `${process.env.RENDER_EXTERNAL_URL}/uploads/${req.file.filename}`;

  const SHOP_DOMAIN = process.env.SHOP_DOMAIN;
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

  try {
    const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/2024-07/customers/${customerid}/metafields.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metafield: {
          namespace: 'custom',
          key: 'profile_picture',
          value: fileUrl,
          type: 'url'
        }
      })
    });
    if (!response.ok) throw new Error('Shopify error: ' + response.statusText);
    res.send('Upload and metafield set!');
  } catch (err) {
    res.status(500).send('Something went wrong: ' + err.message);
  }
});

app.listen(10000, () => console.log('Server running'));
