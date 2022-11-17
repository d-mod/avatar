window.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener(
  "beforeinstallprompt",
  (event: any) => {
    // 监听到可安装事件，进行触发提醒用户
    setTimeout(() => {
      event.prompt();
      event.userChoice // 判断用户是否安装
        .then(() => {
          // eslint-disable-next-line no-console
          console.log("davatar installed.");
        });
    }, 2000);
  },
  { once: true }
);
