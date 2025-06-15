# SUPChat Docker Setup

This repository contains a backend (Node.js/Express) and a React frontend.
Both projects can be built and run using Docker Compose.

## Usage

Ensure Docker and Docker Compose are installed, then run:

```bash
docker-compose up --build
```

The backend will be available on [http://localhost:5000](http://localhost:5000)
and the frontend on [http://localhost:3000](http://localhost:3000).

Environment variables for the backend are defined in `env.txt` and loaded
automatically by Docker Compose.

