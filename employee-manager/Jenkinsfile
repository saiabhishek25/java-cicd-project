pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('employee-manager') {
                    bat 'mvn -B clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                dir('employee-manager') {
                    bat 'mvn test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('employee-manager') {
                    bat 'docker build -t employee-manager .'
                }
            }
        }

        stage('Docker Run') {
            steps {
                bat """
                docker stop employee-manager-container || exit 0
                docker rm employee-manager-container || exit 0
                docker run -d -p 8081:8081 --name employee-manager-container employee-manager
                """
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
    }
}