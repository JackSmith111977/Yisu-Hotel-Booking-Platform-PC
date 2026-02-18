export const ThemeScript = () => {
  const scriptCode = `
    (function() {
      try {
        // 读取存储
        var storageKey = 'app-theme-storage';
        var stored = localStorage.getItem(storageKey);
        
        // 解析 Zustand 的 JSON 结构
        var theme = 'light';
        if (stored) {
          try {
            var parsed = JSON.parse(stored);
            if (parsed.state && parsed.state.theme) {
              theme = parsed.state.theme;
            }
          } catch (e) {}
        }

        // 立即应用主题
        if (theme === 'dark') {
          document.body.setAttribute('arco-theme', 'dark');
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: scriptCode,
      }}
    />
  );
};
