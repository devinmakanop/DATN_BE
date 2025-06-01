const translate = require('@vitalets/google-translate-api');

async function translateObject(obj, targetLang) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, targetLang)));
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = await translateObject(obj[key], targetLang);
    }
    return result;
  } else if (typeof obj === 'string') {
    // Dịch string sang targetLang
    try {
      const res = await translate(obj, { to: targetLang });
      return res.text;
    } catch (err) {
      console.error('Translation error:', err);
      return obj; // lỗi dịch thì trả về nguyên bản
    }
  }
  // Nếu không phải string, array hay object, giữ nguyên
  return obj;
}

module.exports = async function autoTranslateMiddleware(req, res, next) {
  const targetLang = req.query.lng;

  if (!targetLang) {
    return next();
  }

  // Lưu lại hàm res.json gốc
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    try {
      const translatedData = await translateObject(data, targetLang);
      return originalJson(translatedData);
    } catch (err) {
      console.error('Middleware translation error:', err);
      return originalJson(data);
    }
  };

  next();
};
