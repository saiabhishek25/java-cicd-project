# Employee Manager CI/CD Project

This project is a Spring Boot Employee Management application built with Java 17, Maven, H2, Docker, and Jenkins.

## What this project does

- Provides a REST API for employee management
- Uses H2 in-memory database for quick local testing
- Serves a static React-like dashboard from `src/main/resources/static`
- Is packaged as a Spring Boot executable JAR
- Can be containerized with Docker
- Can be automated with Jenkins using the included `Jenkinsfile`

## Prerequisites

- Java JDK 17
- Maven
- Git
- Docker
- Jenkins (for CI/CD automation)

## Local development

1. Build the project:

```bash
mvn clean package
```

2. Run the app locally:

```bash
mvn spring-boot:run
```

3. Open the app:

- http://localhost:8081

4. Open the H2 console:

- http://localhost:8081/h2-console

## Docker

Build the Docker image:

```bash
docker build -t employee-manager-app .
```

Run the Docker container:

```bash
docker run -d -p 8081:8081 --name employee-manager-app employee-manager-app
```

Open the app in the browser:

- http://localhost:8081

## Jenkins CI/CD

1. Install Jenkins and open the dashboard:

- http://localhost:8080

2. Install plugins:

- Git
- Pipeline
- Docker Pipeline
- Maven Integration

3. Create a new Pipeline job.

4. Configure the Pipeline to use the repository.

5. Use the included `Jenkinsfile` in the repository.

6. Run `Build Now`.

## Project layout

```
employee-manager/
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
├── Dockerfile
├── Jenkinsfile
├── pom.xml
├── README.md
```

## Notes

- The app is configured to run on port `8081` because Jenkins commonly uses port `8080`.
- The Docker container is also exposed on `8081`.
- The `Jenkinsfile` builds, tests, packages, creates a Docker image, and starts the container.
