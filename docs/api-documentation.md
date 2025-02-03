# NetViz Nexus API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
    - [Network Configurations](#network-configurations)
    - [Users](#users)
4. [WebSocket API](#websocket-api)
5. [Error Handling](#error-handling)

## Introduction

The NetViz Nexus API allows developers to interact with the NetViz Nexus platform programmatically. This documentation provides details on available endpoints, authentication methods, and expected request/response formats.

## Authentication

NetViz Nexus uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, include the JWT token in the Authorization header of your requests:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

To obtain a JWT token, use the login endpoint described in the Users section.

## API Endpoints

### Network Configurations

#### Get All Configurations

- **URL**: \`/api/network-configs\`
- **Method**: \`GET\`
- **Authentication**: Required
- **Description**: Retrieves all network configurations for the authenticated user.
- **Response**:
  \`\`\`json
  {
  "configs": [
  {
  "id": "string",
  "name": "string",
  "data": "object",
  "createdAt": "string",
  "updatedAt": "string"
  }
  ]
  }
  \`\`\`

#### Create Configuration

- **URL**: \`/api/network-configs\`
- **Method**: \`POST\`
- **Authentication**: Required
- **Description**: Creates a new network configuration.
- **Request Body**:
  \`\`\`json
  {
  "name": "string",
  "data": "object"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "config": {
  "id": "string",
  "name": "string",
  "data": "object",
  "createdAt": "string",
  "updatedAt": "string"
  }
  }
  \`\`\`

#### Get Configuration

- **URL**: \`/api/network-configs/:id\`
- **Method**: \`GET\`
- **Authentication**: Required
- **Description**: Retrieves a specific network configuration.
- **Response**:
  \`\`\`json
  {
  "id": "string",
  "name": "string",
  "data": "object",
  "createdAt": "string",
  "updatedAt": "string"
  }
  \`\`\`

#### Update Configuration

- **URL**: \`/api/network-configs/:id\`
- **Method**: \`PUT\`
- **Authentication**: Required
- **Description**: Updates a specific network configuration.
- **Request Body**:
  \`\`\`json
  {
  "name": "string",
  "data": "object"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "id": "string",
  "name": "string",
  "data": "object",
  "createdAt": "string",
  "updatedAt": "string"
  }
  \`\`\`

#### Delete Configuration

- **URL**: \`/api/network-configs/:id\`
- **Method**: \`DELETE\`
- **Authentication**: Required
- **Description**: Deletes a specific network configuration.
- **Response**:
  \`\`\`json
  {
  "message": "Network configuration deleted successfully"
  }
  \`\`\`

### Users

#### Register

- **URL**: \`/api/auth/register\`
- **Method**: \`POST\`
- **Authentication**: Not required
- **Description**: Registers a new user.
- **Request Body**:
  \`\`\`json
  {
  "name": "string",
  "email": "string",
  "password": "string"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "user": {
  "id": "string",
  "name": "string",
  "email": "string"
  }
  }
  \`\`\`

#### Login

- **URL**: \`/api/auth/login\`
- **Method**: \`POST\`
- **Authentication**: Not required
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  \`\`\`json
  {
  "email": "string",
  "password": "string"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
  "token": "string"
  }
  \`\`\`

## WebSocket API

NetViz Nexus uses WebSockets for real-time updates and collaboration. The WebSocket server is available at:

\`\`\`
ws://your-domain.com/api/socketio
\`\`\`

### Events

- \`join-room\`: Join a specific configuration room
- \`node-update\`: Update a node in the network diagram
- \`node-position-update\`: Update the position of a node
- \`user-presence\`: Update user presence information

For detailed usage of these events, refer to the WebSocket section in the user guide.

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

- 2xx range indicate success
- 4xx range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.)
- 5xx range indicate an error with NetViz Nexus's servers

Errors will include a JSON response body with additional details:

\`\`\`json
{
"error": "Error message here"
}
\`\`\`

For any questions or issues not covered in this documentation, please contact our support team.

