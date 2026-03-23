pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "linsta-backend"
        DOCKER_IMAGE_FRONTEND = "linsta-frontend"
    }

    stages {
        stage('Clone') {
            steps {
                // Unga sariyaana GitHub URL inga irukkanum
                git branch: 'main', credentialsId: 'github-creds', url: 'https://github.com/ramyadharshinim737-cloud/insta-event-project.git'
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "Building Docker Images..."
                    // Hyphen-ah remove pannitu space kudunga
                    sh "docker compose build" 
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying Containers..."
                    // Hyphen-ah remove pannitu space kudunga
                    sh "docker compose up -d"
                }
            }
        }
            
        }
    }

    post {
        success {
            echo "✅ Deployment Success!"
        }
        failure {
            echo "❌ Deployment Failed!"
        }
    }
}