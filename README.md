# Fintech Project Phase 1

> **[View Complete Project Documentation](./PROJECT_DOCUMENTATION.md)**

## Prerequisites
- **Docker Desktop**: Must be installed and running.

## How to Run

1. **Start Docker Desktop**: Ensure the Docker Desktop application is open and running on your machine.

2. **Open Terminal**: Navigate to the project root directory:
   ```bash
   cd /Users/abhijith/Christ/project/fintechphase1
   ```

3. **Start Services**: Run the following command to build and start all services (Frontend, Backend, ML Service, Database, Redis):
   ```bash
   docker-compose up --build -d
   ```

4. **Verify Execution**: Check if all containers are running:
   ```bash
   docker ps
   ```

## Access Points
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **ML Service**: [http://localhost:8001](http://localhost:8001)

## Stopping the Project
To stop and remove the containers:
```bash
docker-compose down
```
