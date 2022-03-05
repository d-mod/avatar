if (!import.meta.env.DEV) {
	// if (!location.hostname.endsWith("localhost") && !location.hostname.endsWith("gitee.io")) {
	// 	location.href = "//davatar.gitee.io"
	// }
}

window.addEventListener("contextmenu", e => e.preventDefault())

window.addEventListener(
	"beforeinstallprompt",
	function (event: any) {
		// 监听到可安装事件，进行触发提醒用户
		setTimeout(function () {
			event.prompt()
			event.userChoice //判断用户是否安装
				.then(() => {
					console.log("davatar installed.")
				})
		}, 2000)
	},
	{ once: true }
)
