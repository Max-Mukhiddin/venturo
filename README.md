# Venturo API

Backend for **Venturo**, a full-stack e-commerce platform focused on outdoor products and end-to-end commerce workflows.

Venturo evolved from architecture learned in earlier course work into an independent portfolio product with authentication, products, inventory-oriented flows, checkout, administration, sessions, real-time communication, and production deployment.

> Live product: https://venturo.network/  
> Frontend repository: https://github.com/Max-Mukhiddin/venturo-react  
> Portfolio: https://max-mukhiddin.github.io/homepage/

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** + Mongoose
- **JWT** authentication
- **Express Session** + MongoDB session storage
- **Socket.IO**
- **EJS** for server-rendered administration views
- bcryptjs
- Multer for uploads
- PM2 / Linux production workflow

## Core Areas

### Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Cookie/session support
- Protected application flows

### Commerce

- Product management
- Product discovery
- Checkout-oriented workflows
- Media upload handling

### Administration

The backend supports server-rendered EJS administration interfaces alongside API-driven frontend functionality.

### Real-Time Features

Socket.IO is used for real-time communication between the backend and connected clients.

## Architecture

```text
React Client
     |
     v
Express + TypeScript
  |      |      |
  v      v      v
MongoDB  EJS   Socket.IO
```

## Local Development

### Install

```bash
npm install
```

### Development

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm run start:prod
```

## Environment

Application secrets and deployment-specific configuration should be provided through environment variables rather than committed source files.

## Project Background

Venturo was developed after working through the Burak course project. The earlier project was used to learn the underlying full-stack architecture; Venturo applies and extends those concepts as a separate commerce product with its own domain, UI, workflows, and deployment.

## Author

**Mukhiddin “Max” Solijonov**  
Full-Stack · DevOps · AI Engineer  
South Korea

- Portfolio: https://max-mukhiddin.github.io/homepage/
- GitHub: https://github.com/Max-Mukhiddin
