pipeline {
  agent any
  stages {
    stage('Build') {
      node('nodejs'){
        bat 'pnpm install'
        bat 'pnpm run build'
      }
    }
  }

  post {
    always {
      bat 'rmdir /s /q ${NGINX_ROOT}\\avatar\\assets'
      bat 'xcopy /e /i /y ${WORKSPACE}\\dist ${NGINX_ROOT}\\avatar'
    }
  }
}
