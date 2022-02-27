if (!import.meta.env.DEV) {
	if (!location.hostname.endsWith("localhost") && !location.hostname.endsWith("gitee.io")) {
		location.href = "//davatar.gitee.io"
	}
	clearDevTools()
}

document.querySelector("#app")?.addEventListener("contextmenu", e => e.preventDefault())

function clearDevTools() {
	setTimeout(() => {
		debugger
		clearDevTools()
	}, 1)
}
