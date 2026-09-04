// JS/skincare.js
console.log(">>> hairbody.js 成功載入並開始執行！");

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
      <article class="product-card" data-subcategory="${item.subCategory}">
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
    pillContainer.addEventListener("click", (e) => {
      const clickedPill = e.target.closest(".pill");
      if (!clickedPill) return;

      const selected = clickedPill.dataset.sub;
      pills.forEach(p => p.classList.remove("active"));
      clickedPill.classList.add("active");

      const cards = document.querySelectorAll("#productsContainer .product-card");
      cards.forEach(card => {
        if (selected === "all" || card.dataset.subcategory === selected) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
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

// 4. 主執行入口（不等待 DOMContentLoaded，立即非同步執行）
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
    const skincareList = await fetchProducts("empties");
    console.log(">>> 資料請求完成，筆數:", skincareList.length);
    renderProducts(skincareList);
  } catch (err) {
    console.error("載入失敗:", err);
  }
}

// 立即啟動
main();