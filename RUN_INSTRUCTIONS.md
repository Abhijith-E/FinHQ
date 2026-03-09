# How to Run the FinTech Phase 1 Project

The simplest and most reliable way to run this full-stack application (Frontend, Backend, ML Service, Database, and Caching) is by using **Docker Compose**.

## Prerequisites
Make sure you have Docker Desktop installed and running on your Mac.

## Quick Start (All-in-One)

1. **Open your Terminal**.
2. **Navigate to the project directory**:
   ```bash
   cd /Users/abhijith/Christ/project/fintechphase1
   ```
3. **Start the applications**: Run the following command. It will build and start all necessary services in the background.
   ```bash
   docker-compose up -d --build
   ```

### Fallback (If Docker throws an error building the Next.js Frontend)
If you encounter system errors (like OS-level architecture linking issues or `input/output error` in Docker) when building the frontend:
1. Start only the backend services via Docker:
   ```bash
   docker-compose up -d backend ml-service db redis mlflow flower
   ```
2. Run the frontend locally in a separate terminal:
   ```bash
   cd frontend
   npm run dev
   ```

## Managing the Services

- **To see the logs** and monitor what's happening (type `Ctrl+C` to exit the logs view):
  ```bash
  docker-compose logs -f
  ```
- **To stop the project**:
  ```bash
  docker-compose down
  ```
- **To stop the project AND wipe the database data** (start completely fresh next time):
  ```bash
  docker-compose down -v
  ```

## Accessing the Platforms
Once the containers are successfully running, you can access the different pieces of the project securely in your web browser:

1. **Frontend Dashboard (Next.js)**
   [http://localhost:3000](http://localhost:3000)

2. **Backend API Documentation (FastAPI Swagger UI)**
   [http://localhost:8000/docs](http://localhost:8000/docs)

3. **Machine Learning Service API**
   [http://localhost:8001/docs](http://localhost:8001/docs)

4. **MLflow (Experiment Tracking & Models)**
   [http://localhost:5000](http://localhost:5000)

5. **Flower (Celery/Task Queue Monitor)**
   [http://localhost:5555](http://localhost:5555)

If you change code on your computer, you may need to re-run `docker-compose up --build -d` to compile the new changes into the containers.
