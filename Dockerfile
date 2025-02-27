FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

COPY bytesize_backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY bytesize_frontend/package*.json frontend/
RUN cd frontend && npm install

COPY bytesize_backend backend
COPY bytesize_frontend frontend

RUN cd frontend && npm run build

EXPOSE 8000

CMD ["python", "backend/main.py"]