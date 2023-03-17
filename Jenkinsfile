//自动构建
nodejs('node') {
  bat 'pnpm config set registry https://registry.npmmirror.com'
  bat 'pnpm install'
  bat 'pnpm run build'
}

post {
  always {
    bat 'rmdir /q /s ${NGINX_ROOT}/avatar/assets'
    bat 'xcopy /e /y /i ${WORKSPACE}/dist ${NGINX_ROOT}/html/avatar/'
  }
}
