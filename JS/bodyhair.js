// JS/bodyhair.js (或對應的 JS 檔名)
console.log(">>> bodyhair.js 成功載入並開始執行！");

// 記錄篩選狀態與商品原始資料
let rawProductList = [];
let curSub = 'all';
let curTag = 'all';

// ==========================
// 工具 1：負責卡片過濾（大類 + 次標籤）
// ==========================
function filterAll() {
  const cards = document.querySelectorAll("#productsContainer .product-card");
  cards.forEach(card => {
    // 取得卡片上的 subCategory 字串切成陣列（支援逗號與空白）
    const tags = (card.dataset.subcategory || "").split(/[,，\s]+/).map(t => t.trim().toLowerCase());

    const matchSub = (curSub === "all" || tags.includes(curSub.toLowerCase()));
    const matchTag = (curTag === "all" || tags.includes(curTag.toLowerCase()));

    if (matchSub && matchTag) {
      card.classList.remove("hidden");
      card.style.display = "";
    } else {
      card.classList.add("hidden");
      card.style.display = "none";
    }
  });
}

// ==========================
// 工具 2：負責在下方生出「第二層按鈕」
// ==========================
function buildSubTags(subKey) {
  const box = document.getElementById("featurePills");
  if (!box) return;

  // 選「全部」時清空並隱藏二級選單
  if (subKey === "all") {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  // 抓出屬於這個大類的所有小關鍵字（排除大類本身）
  const tagSet = new Set();
  rawProductList.forEach(item => {
    const rawStr = String(item.subCategory || "");
    const tags = rawStr.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);
    
    // 如果這筆資料屬於當前大類
    if (tags.some(t => t.toLowerCase() === subKey.toLowerCase())) {
      tags.forEach(t => {
        if (t.toLowerCase() !== subKey.toLowerCase()) {
          tagSet.add(t);
        }
      });
    }
  });

  const tagList = Array.from(tagSet);

  // 如果這大類沒有任何額外關鍵字，隱藏容器
  if (tagList.length === 0) {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  // 產出按鈕（預設第一顆為「全部」）
  box.style.display = "flex";
  let buttonsHtml = `<button class="pill active" data-val="all">全部</button>`;
  buttonsHtml += tagList.map(t => `<button class="pill" data-val="${t}">${t}</button>`).join("");
  box.innerHTML = buttonsHtml;

  // 綁定二級按鈕點擊事件
  box.querySelectorAll(".pill").forEach(btn => {
    btn.onclick = () => {
      box.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      curTag = btn.dataset.val;
      filterAll();
    };
  });
}

// 1. 卡片 HTML 渲染函式
function renderProducts(dataList) {
  const container = document.getElementById("productsContainer");
  if (!container) {
    console.error("找不到 #productsContainer 容器！");
    return;
  }

  if (!dataList || dataList.length === 0) {
    container.innerHTML = `<div class="empty-msg" style="text-align:center; padding: 40px; color:#888;">目前尚無商品資料</div>`;
    return;
  }

  container.innerHTML = dataList.map(item => {
    // 組合功效列表
    const effectsHtml = (item.effects || []).map(eff => `
      <div class="effect-item">
        <span class="effect-badge ${eff.color || 'blue'}">${eff.badge}</span>
        <p class="effect-desc">${eff.desc}</p>
      </div>
    `).join("");

    // 組合優缺點
    const prosConsHtml = (item.pros || item.cons) ? `
      <div class="pros-cons-box">
        ${item.pros ? `
          <div class="pros-item">
            <span class="pros-label"><i class="fa-regular fa-thumbs-up"></i> 優點</span>
            <p class="pros-text">${item.pros}</p>
          </div>` : ""}
        ${item.cons ? `
          <div class="cons-item">
            <span class="cons-label"><i class="fa-regular fa-thumbs-down"></i> 缺點</span>
            <p class="cons-text">${item.cons}</p>
          </div>` : ""}
      </div>
    ` : "";

    // 組合標籤
    const tagsHtml = (item.tags || []).map(t => `<span class="tag-item">${t}</span>`).join("");

    // 用法處理
    let usageContentHtml = "";
    if (Array.isArray(item.usage)) {
      usageContentHtml = item.usage.map(u => `
        <div class="usage-step-item">
          <strong class="usage-step-title">${u.title}：</strong>
          <span class="usage-step-desc">${u.desc}</span>
        </div>
      `).join("");
    } else if (item.usage) {
      usageContentHtml = `<span class="usage-text">${item.usage}</span>`;
    }

    return `
      <article class="product-card" data-subcategory="${item.subCategory || ''}">
        <div class="card-img-wrapper">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-header-info">
            <span class="brand-title">${item.brand}</span>
            <h3 class="product-title">${item.name}</h3>

            ${item.highlight ? `
              <div class="product-highlight-badge">
                <i class="fa-solid fa-crown"></i> ${item.highlight}
              </div>` : ""}

            ${item.target ? `
              <div class="skin-target-pill">
                <i class="fa-solid fa-sparkles"></i> ${item.target}
              </div>` : ""}
          </div>

          <div class="product-meta">
            ${item.spec ? `<span class="meta-item"><i class="fa-solid fa-flask"></i> ${item.spec}</span>` : ""}
            ${item.price ? `<span class="meta-item"><i class="fa-solid fa-tag"></i> NT$ ${item.price}</span>` : ""}
          </div>

          ${effectsHtml ? `<div class="review-box">${effectsHtml}</div>` : ""}
          ${prosConsHtml}

          ${usageContentHtml ? `
            <div class="usage-box">
              <span class="usage-tag"><i class="fa-regular fa-clock"></i> 建議用法</span>
              <div class="usage-content-list">${usageContentHtml}</div>
            </div>` : ""}

          ${tagsHtml ? `<div class="tags-list">${tagsHtml}</div>` : ""}
        </div>
      </article>
    `;
  }).join("");

  // 渲染完成後綁定圖片放大效果
  initImageModal();
}

// 2. 側邊抽屜與分類篩選綁定
function setupControls() {
  // 分類按鈕篩選
  const pillContainer = document.getElementById("subCategoryPills");
  if (pillContainer) {
    const pills = pillContainer.querySelectorAll(".pill");
    pills.forEach(pill => {
      pill.onclick = () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        curSub = pill.dataset.sub;
        curTag = "all"; // 切換大分類時，小分類重設回全部

        buildSubTags(curSub); // 1. 生出二級標籤
        filterAll();          // 2. 篩選卡片
      };
    });
  }

  // 側邊選單 Drawer
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const sideDrawer = document.getElementById("sideDrawer");

  function openDrawer() {
    if (sideDrawer) sideDrawer.classList.add("open");
    if (drawerOverlay) drawerOverlay.classList.add("active");
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("active");
  }

  if (hamburgerBtn) hamburgerBtn.onclick = openDrawer;
  if (closeDrawerBtn) closeDrawerBtn.onclick = closeDrawer;
  if (drawerOverlay) drawerOverlay.onclick = closeDrawer;
}

// 3. 圖片放大 Lightbox 功能
function initImageModal() {
  const imageModal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalClose = document.getElementById("modalClose");

  function closeModal() {
    if (imageModal) {
      imageModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll(".card-img-wrapper img").forEach(img => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      if (imageModal && modalImg) {
        modalImg.src = img.src;
        imageModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  if (modalClose) modalClose.onclick = closeModal;
  if (imageModal) {
    imageModal.onclick = (e) => {
      if (e.target === imageModal) closeModal();
    };
  }
}

// 4. 主執行入口
async function main() {
  const container = document.getElementById("productsContainer");
  if (container) {
    container.innerHTML = `
      <div class="loading-box" style="text-align:center; padding: 60px 0; width: 100%; color: #888;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 12px;"></i>
        <p>商品資料同步中，請稍候...</p>
      </div>
    `;
  }

  setupControls();

  try {
    console.log(">>> 正在向 Google 試算表請求資料...");
    const dataList = await fetchProducts("bodyhair");
    console.log(">>> 資料請求完成，筆數:", dataList.length);
    
    rawProductList = dataList; // 👈 存入全域，讓 buildSubTags 可以抓標籤
    renderProducts(dataList);
  } catch (err) {
    console.error("載入失敗:", err);
  }
}

// 立即啟動
main();