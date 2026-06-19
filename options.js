document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url');
  const saveBtn = document.getElementById('save');

  // 读取已保存的网址
  if (chrome && chrome.storage) {
    chrome.storage.sync.get({ targetUrl: '' }, (data) => {
      urlInput.value = data.targetUrl || '';
    });
  }

  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = urlInput.value.trim();

    // 留空 → 清除配置，新标签页使用内置主页
    if (!val) {
      chrome.storage.sync.set({ targetUrl: '' }, () => {
        saveBtn.textContent = '已保存';
        setTimeout(() => (saveBtn.textContent = '保存'), 1200);
      });
      return;
    }

    // 非空 → 校验合法性后保存
    try {
      const parsed = new URL(val);
      chrome.storage.sync.set({ targetUrl: parsed.href }, () => {
        saveBtn.textContent = '已保存';
        setTimeout(() => (saveBtn.textContent = '保存'), 1200);
      });
    } catch (err) {
      alert('请输入合法的网址（需包含 http:// 或 https://）');
    }
  });
});
