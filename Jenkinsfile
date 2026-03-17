pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/cubeaisolutionstech/Insta-event1'
            }
        }
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }
    }
    post {
        success {
            echo '✅ Deployment Success!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
