// 新标签页重定向 shim
// 逻辑：
//   - 设置了合法 targetUrl → 跳转到该网址（沿用 DIY_homepage 行为）
//   - 未设置 / URL 非法 / storage 不可用 → 跳转内置主页 index.html
// 使用 location.replace() 不进历史栈，符合新标签页预期。
(function () {
  const goHome = () => location.replace('index.html');

  if (!chrome || !chrome.storage) {
    goHome();
    return;
  }

  chrome.storage.sync.get({ targetUrl: '' }, (data) => {
    const url = (data && data.targetUrl || '').trim();
    if (!url) {
      goHome();
      return;
    }
    try {
      location.replace(new URL(url).href);
    } catch (e) {
      goHome();
    }
  });
})();
