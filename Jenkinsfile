pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        nodejs('node'){
          bat 'pnpm config set registry https://registry.npmmirror.com'
          bat 'pnpm install'
          bat 'pnpm run build'
        }
      }
    }
    stage('Copy Files'){
      steps {
        script {
          if(fileExists("${NGINX_ROOT}\\avatar\\assets")){
            bat "rd /s /q ${NGINX_ROOT}\\avatar\\assets"
          }
        }
        bat "xcopy /e /i /y ${WORKSPACE}\\dist ${NGINX_ROOT}\\avatar"
      }
    }
  }
}
