FROM python:3.11-slim

WORKDIR /app

# Install Flask and Werkzeug
RUN pip install --no-cache-dir flask werkzeug

# Copy microservice entrypoint
COPY reels_api.py .

# Expose microservice port
EXPOSE 5050

# Run Flask microservice
CMD ["python", "reels_api.py"]
