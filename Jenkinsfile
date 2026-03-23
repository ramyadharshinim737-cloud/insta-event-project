pipeline {
    agent any
    stages {
        stage('Clone') {
    steps {
        // Intha URL-ah unga sariyaana repo URL-ku mathunga
        git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/ramyadharshinim737-cloud/insta-event-project.git'
    }
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
