// JS/skincare.js
console.log(">>> [skincare.js V2 - 二級多選 AND 邏輯] 成功載入！");

let allProductsData = [];
let currentCategory = "all";
let selectedTags = new Set(); // 儲存多選標籤，為空代表「全部」

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
    const effectsHtml = (item.effects || []).map(eff => `
      <div class="effect-item">
        <span class="effect-badge ${eff.color || 'blue'}">${eff.badge}</span>
        <p class="effect-desc">${eff.desc}</p>
      </div>
    `).join("");

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

    const tagsHtml = (item.tags || []).map(t => `<span class="tag-item">${t}</span>`).join("");

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

  initImageModal();
}

// 2. 自動抽取二級標籤（多選切換）
function updateFeaturePills(catKey) {
  const featureBox = document.getElementById("featurePills");
  if (!featureBox) {
    console.error("找不到 #featurePills 容器，請確認 HTML！");
    return;
  }

  if (catKey === "all") {
    featureBox.innerHTML = "";
    featureBox.style.display = "none";
    return;
  }

  // 篩選出包含此大類別的資料
  const matchedItems = allProductsData.filter(item => {
    const rawVal = String(item.subCategory || "");
    const tags = rawVal.split(/[,，\s]+/).map(t => t.trim().toLowerCase());
    return tags.includes(catKey.toLowerCase());
  });

  console.log(`[updateFeaturePills] 當前大分類: ${catKey}，找到商品數:`, matchedItems.length);

  // 抓出所有次標籤
  const tagSet = new Set();
  matchedItems.forEach(item => {
    const rawVal = String(item.subCategory || "");
    const tags = rawVal.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);
    tags.forEach(t => {
      if (t.toLowerCase() !== catKey.toLowerCase()) {
        tagSet.add(t);
      }
    });
  });

  const availableTags = Array.from(tagSet);
  console.log(`[updateFeaturePills] 自動抓取出的標籤:`, availableTags);

  if (availableTags.length === 0) {
    featureBox.innerHTML = "";
    featureBox.style.display = "none";
    return;
  }

  let buttonsHtml = `
    <button class="pill feature-pill ${selectedTags.size === 0 ? 'active' : ''}" data-val="all">
      全部
    </button>
  `;

  buttonsHtml += availableTags.map(tag => `
    <button class="pill feature-pill ${selectedTags.has(tag) ? 'active' : ''}" data-val="${tag}">
      ${tag}
    </button>
  `).join("");

  featureBox.style.display = "flex";
  featureBox.innerHTML = buttonsHtml;

  // 綁定二級按鈕點選（多選 Toggle）
  featureBox.querySelectorAll(".feature-pill").forEach(btn => {
    btn.onclick = () => {
      const val = btn.dataset.val;

      if (val === "all") {
        // 點選全部：清空所有選取的標籤
        selectedTags.clear();
        featureBox.querySelectorAll(".feature-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        // 點選特定標籤：切換選取狀態
        const allBtn = featureBox.querySelector('.feature-pill[data-val="all"]');

        if (selectedTags.has(val)) {
          selectedTags.delete(val);
          btn.classList.remove("active");
        } else {
          selectedTags.add(val);
          btn.classList.add("active");
        }

        // 當所有標籤都被取消時，自動選回「全部」
        if (selectedTags.size === 0) {
          if (allBtn) allBtn.classList.add("active");
        } else {
          if (allBtn) allBtn.classList.remove("active");
        }
      }

      console.log(">>> 目前選取的二級標籤:", Array.from(selectedTags));
      filterCards();
    };
  });
}

// 3. 卡片過濾（AND 邏輯：必須同時包含所有勾選的標籤）
function filterCards() {
  const cards = document.querySelectorAll("#productsContainer .product-card");

  cards.forEach(card => {
    const subStr = card.dataset.subcategory || "";
    const tagArray = subStr.split(/[,，\s]+/).map(t => t.trim());

    // 1. 第一層大分類判斷
    const matchCategory = (
      currentCategory === "all" ||
      tagArray.some(t => t.toLowerCase() === currentCategory.toLowerCase())
    );

    // 2. 第二層標籤判斷（AND 邏輯：所有已選的標籤，卡片都必須擁有）
    let matchTag = true;
    if (selectedTags.size > 0) {
      matchTag = Array.from(selectedTags).every(selected => tagArray.includes(selected));
    }

    if (matchCategory && matchTag) {
      card.classList.remove("hidden");
      card.style.display = "";
    } else {
      card.classList.add("hidden");
      card.style.display = "none";
    }
  });
}

// 4. 事件監聽綁定
function setupControls() {
  const pillContainer = document.getElementById("subCategoryPills");
  if (pillContainer) {
    const pills = pillContainer.querySelectorAll(".pill");
    pills.forEach(pill => {
      pill.onclick = () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        currentCategory = pill.dataset.sub;
        selectedTags.clear(); // 切換大分類時，自動重置第二層標籤

        console.log(">>> 點擊了一級大類:", currentCategory);
        updateFeaturePills(currentCategory);
        filterCards();
      };
    });
  }

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

// 5. 圖片放大 Lightbox
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

// 6. 主執行入口
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
    allProductsData = await fetchProducts("skincare");
    console.log(">>> [最新資料] 載入成功，總筆數:", allProductsData.length);
    renderProducts(allProductsData);
  } catch (err) {
    console.error("載入失敗:", err);
  }
}

main();