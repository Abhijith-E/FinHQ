FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY pyproject.toml .
# We are skipping poetry for simplicity in this initial setup and using pip directly if no poetry.lock, 
# but properly we should use poetry. For now let's use a simple pip install based on pyproject or requirements.
# To keep it robust, let's just use pip with a requirements.txt generated or direct install.
# Actually, the user guidelines mentioned "Initialize FastAPI project...".
# I'll use pip for simplicity in the Dockerfile given I don't want to force poetry on the user if they don't have it, 
# but the plan mentioned pyproject.toml. I will install poetry in the docker image.

RUN pip install poetry
RUN poetry config virtualenvs.create false

# Copy project
COPY . .

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
