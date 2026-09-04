// 漢堡選單開關邏輯
const hamburgerBtn = document.getElementById("hamburgerBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const sideDrawer = document.getElementById("sideDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");

function openDrawer() {
  sideDrawer.classList.add("active");
  drawerOverlay.classList.add("active");
}

function closeDrawer() {
  sideDrawer.classList.remove("active");
  drawerOverlay.classList.remove("active");
}

if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);