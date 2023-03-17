pipeline {
  stages {
    stage('Build') {
      node('nodejs'){
        sh 'pnpm install'
        sh 'pnpm run build'
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
