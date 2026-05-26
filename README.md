# Automated Deployment Pipeline for Java Application

## 📌 Project Overview

This project demonstrates an Automated CI/CD Deployment Pipeline for a Java Spring Boot Application using:

* Jenkins
* Docker
* Apache Maven
* GitHub
* Spring Boot

The project automates the complete software delivery lifecycle including:

* Source Code Checkout
* Build Automation
* Testing
* Docker Image Creation
* Containerized Deployment

---

# 🚀 Technologies Used

| Technology   | Purpose                                  |
| ------------ | ---------------------------------------- |
| Java 17      | Application Development                  |
| Spring Boot  | Backend Framework                        |
| Maven        | Build Automation & Dependency Management |
| Jenkins      | CI/CD Pipeline Automation                |
| Docker       | Containerization                         |
| Git & GitHub | Version Control                          |
| JUnit        | Automated Testing                        |

---

# 📂 Project Structure

```bash
java-cicd-project/
│
├── employee-manager/
│   ├── src/
│   ├── Dockerfile
│   ├── Jenkinsfile
│   ├── pom.xml
│   └── README.md
```

---

# ⚙️ CI/CD Workflow

```text
Developer
   ↓
GitHub Repository
   ↓
Jenkins Pipeline Trigger
   ↓
Maven Build & Test
   ↓
Docker Image Build
   ↓
Docker Container Deployment
   ↓
Application Running on Port 8081
```

---

# 🛠️ Prerequisites

Before running this project, install:

* Java JDK 17
* Apache Maven
* Docker Desktop
* Jenkins
* Git

---

# ▶️ Run Project Locally

## Step 1 — Clone Repository

```bash
git clone https://github.com/saiabhishek25/java-cicd-project.git
```

---

## Step 2 — Navigate to Project

```bash
cd java-cicd-project/employee-manager
```

---

## Step 3 — Build Project

```bash
mvn clean package
```

---

## Step 4 — Run Application

```bash
mvn spring-boot:run
```

Application runs at:

```text
http://localhost:8081
```

---

# 🐳 Docker Setup

## Build Docker Image

```bash
docker build -t employee-manager .
```

---

## Run Docker Container

```bash
docker run -d -p 8081:8081 --name employee-manager-container employee-manager
```

---

## Verify Running Containers

```bash
docker ps
```

---

# 🔄 Jenkins CI/CD Pipeline

The Jenkins pipeline performs the following stages automatically:

* Checkout Source Code
* Build Application
* Execute Tests
* Build Docker Image
* Run Docker Container

---

# 📜 Jenkinsfile Pipeline Stages

```groovy
Checkout
Build
Test
Docker Build
Docker Run
```

---

# ✅ Features

* Automated CI/CD Pipeline
* Dockerized Spring Boot Application
* Maven Build Automation
* Jenkins Pipeline Integration
* GitHub Source Control
* Automated Testing using JUnit
* Containerized Deployment

---

# 📸 Screenshots

Add screenshots here for:

* Jenkins Dashboard
* Successful Pipeline Execution
* Docker Running Container
* Application Running in Browser

---

# 🔍 Testing

Run unit tests using:

```bash
mvn test
```

---

# 📈 Advantages

* Reduces manual deployment effort
* Faster software delivery
* Consistent deployment environments
* Improved software reliability
* Automated testing and deployment

---

# 🚧 Future Enhancements

* Kubernetes Deployment
* AWS Cloud Deployment
* GitHub Webhooks
* Monitoring using Prometheus & Grafana
* Email Notifications in Jenkins
* DevSecOps Integration

---

# 👨‍💻 Author

**Sai Abhishek**
Bachelor of Technology – Computer Science & Engineering
Lovely Professional University

---

# 📄 License

This project is developed for educational and academic purposes.
