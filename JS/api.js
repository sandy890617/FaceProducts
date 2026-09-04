// JS/api.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzHnrXebECzKwEOVdLebdLF4yU13KWnwA2UOt0hF4rpqe0wfOM-v7J6njS8bypUzfcTmg/exec";
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 快取 10 分鐘

// 支援傳入工作表名稱，以及是否強制重新抓取 (forceRefresh)
async function fetchProducts(sheetName = "skincare", forceRefresh = false) {
  const cacheKey = `cache_${sheetName}`;
  const cached = localStorage.getItem(cacheKey);

  // 1. 若非強制更新，檢查快取是否有效
  if (!forceRefresh && cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY_MS && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("快取解析異常，重新向試算表請求");
    }
  }

  // 2. 向 Google Apps Script 請求指定工作表
  try {
    const response = await fetch(`${GAS_API_URL}?sheet=${encodeURIComponent(sheetName)}`);
    if (!response.ok) throw new Error(`HTTP 錯誤狀態碼: ${response.status}`);
    
    const result = await response.json();

    // 檢查回傳是否為後端報錯物件 (例如找不到分頁)
    if (result && result.error) {
      throw new Error(result.error);
    }

    const data = Array.isArray(result) ? result : [];

    // 存入獨立的快取 Key
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));

    return data;
  } catch (error) {
    console.error(`載入 [${sheetName}] 資料失敗:`, error);
    // 連線或後端出錯時，若本地有舊快取則降級回傳舊資料
    if (cached) {
      try {
        return JSON.parse(cached).data || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}