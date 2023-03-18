if (import.meta.env.PROD) {
  if (navigator.language === "zh-CN" && location.host === "avatar.kritsu.net") {
    location.href = "https://avatar.dcalc.cn";
  }
}
