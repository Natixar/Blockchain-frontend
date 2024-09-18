
# NATIXAR CO2 tracking webapp

## Overview

This project is a web application built with [**Next.js 14**](https://nextjs.org/docs) for server-side rendering and static site generation, styled using [**Tailwind CSS**](https://tailwindcss.com/docs), and configured as a **Progressive Web Application (PWA)** using [**Serwist**](https://serwist.pages.dev/). The app is developed with [**TypeScript**](https://www.typescriptlang.org/docs/) for type safety and integrates [**Web3.js**](https://docs.web3js.org/) for blockchain interactions.

The project includes a **CI/CD pipeline** configured using **GitHub Actions** and is containerized with **Docker** (or **Podman**) for consistent and reliable deployments. End-to-end tests are automated using [**Playwright**](https://playwright.dev/docs/intro) to ensure the application functions as expected across various scenarios.

## Getting Started

### Prerequisites

- [**Node.js**](https://nodejs.org/en/docs) version 20 or higher
- [**Docker**](https://docs.docker.com/get-started/) or [**Podman**](https://podman.io/get-started)
- [**Git**](https://git-scm.com/doc)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository.git
   cd your-repository
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Build for Production

To build and run the application for production:

1. Build the app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Progressive Web App (PWA)

The project is configured to work as a Progressive Web App using [**Serwist**](https://serwist.pages.dev/). This ensures offline capabilities and a mobile-first, installable experience.

### Web3 Integration

This project integrates [**Web3.js**](https://docs.web3js.org/) for blockchain-related interactions. Ensure you have the proper blockchain environment and node configurations when using Web3 functionalities.

## CI/CD Pipeline

The project uses **GitHub Actions** to automate the deployment process. On every push to the `main` branch, the following steps occur:

1. **Code Checkout**: The code is checked out from the repository.
2. **SSH Setup**: Secure SSH connection to the server is established using a stored private key.
3. **Deployment**: The project is pulled on the server, Docker or Podman builds the application, and the container is run with the latest changes.

This ensures the application is always up-to-date with minimal manual intervention.

## Docker/Podman Setup

The application can be containerized using Docker or Podman. The container setup ensures that the app runs in a lightweight, consistent environment across all machines.

### Build and Run the Container

1. Build the Docker image:
   ```bash
   docker build -t blockchain-front .
   ```

2. Run the container:
   ```bash
   docker run -d --name blockchain-front -p 3024:3000 blockchain-front
   ```

The application will be available at `http://localhost:3024`.

### Dockerfile Breakdown

- **Base Image**: The container uses `node:alpine` for a lightweight environment.
- **Security**: A non-root user `nextjs` is created to run the app.
- **File Tracing**: To optimize the Docker image size, output file tracing is used to minimize the container footprint.
- **Health Check**: A health check ensures the app is responsive after deployment.

## Running Tests

End-to-end tests are performed using [**Playwright**](https://playwright.dev/docs/intro) to ensure core functionalities are working correctly. To run the tests locally:

```bash
npx playwright test
```

The tests are configured to run across different browsers and devices, simulating real-world usage scenarios.

## Documentation

The project documentation is generated automatically using [**Typedoc**](https://typedoc.org/guides/overview/). You can generate and view the documentation as follows:

1. Run the Typedoc command:
   ```bash
   npx typedoc
   ```

2. The generated documentation will be available in the `docs` directory.
