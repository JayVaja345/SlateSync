flowchart TD
    %% Frontend Layer
    subgraph "Frontend (React SPA)" 
        direction TB
        MainEntry["Entry Points\nmain.jsx, App.jsx"]:::frontend
        Components["UI Components"]:::frontend
        Pages["Route-Level Pages"]:::frontend
        AuthContext["AuthContext"]:::frontend
        ApiServices["API Service Layer"]:::frontend
        RealTimeClient["Socket.IO Client"]:::frontend
    end

    %% Backend REST API Layer
    subgraph "Backend REST API (Express)" 
        direction TB
        ServerIndex["Server Entry\nindex.js"]:::backend
        DBConfig["DB Connection\nConfig/db.js"]:::backend
        Router["REST Routes\nRouter.js"]:::backend
        AuthMW["Auth Middleware\nauthenticate.js"]:::backend
        DocAccessMW["Doc Access Middleware\ndocumentAccess.js"]:::backend
        Controllers["Controllers\nuserController.js"]:::backend
        UserModel["User Model\nuserSchema.js"]:::backend
        DocModel["Document Model\ndocumentSchema.js"]:::backend
    end

    %% Real-Time Collaboration Layer
    subgraph "Real-Time Server (Socket.IO)" 
        direction TB
        collab["Socket.IO Server\ncollab-server.js"]:::realtime
        docSocket["Document Socket\nserver/Sockets/documentSocket.js"]:::realtime
    end

    %% Database
    DB["MongoDB"]:::database

    %% Frontend Connections
    AuthContext -->|provides token| ApiServices
    Pages -->|calls| ApiServices
    ApiServices -->|HTTPS| ServerIndex
    RealTimeClient -->|WSS| collab

    %% Backend REST Connections
    ServerIndex -->|uses| DBConfig
    DBConfig -->|connects to| DB
    ServerIndex -->|registers routes| Router
    Router -->|JWT check| AuthMW
    Router -->|access check| DocAccessMW
    Router -->|routes to| Controllers
    Controllers -->|reads/writes| UserModel
    Controllers -->|reads/writes| DocModel
    UserModel -->|persists via| DB
    DocModel -->|persists via| DB

    %% Real-Time Connections
    collab -->|loads handlers| docSocket
    docSocket -->|optionally reads/writes| DB
    collab -.->|auth via| AuthMW

    %% Styles
    classDef frontend fill:#D0E8FF,stroke:#0366d6,color:#0366d6;
    classDef backend fill:#E6F4EA,stroke:#1a7f37,color:#1a7f37;
    classDef realtime fill:#FFF4E5,stroke:#b31d00,color:#b31d00;
    classDef database fill:#EDEDED,stroke:#666666,color:#666666;

    %% Click Events
    click MainEntry "https://github.com/jayvaja345/slatesync/blob/main/client/src/main.jsx"
    click MainEntry "https://github.com/jayvaja345/slatesync/blob/main/client/src/App.jsx"
    click Components "https://github.com/jayvaja345/slatesync/tree/main/client/src/Components/"
    click Pages "https://github.com/jayvaja345/slatesync/tree/main/client/src/Pages/"
    click AuthContext "https://github.com/jayvaja345/slatesync/blob/main/client/src/Context/AuthContext.jsx"
    click ApiServices "https://github.com/jayvaja345/slatesync/blob/main/client/src/Services/Apis.jsx"
    click ApiServices "https://github.com/jayvaja345/slatesync/blob/main/client/src/Services/ApiCall.jsx"
    click ServerIndex "https://github.com/jayvaja345/slatesync/blob/main/server/index.js"
    click DBConfig "https://github.com/jayvaja345/slatesync/blob/main/server/Config/db.js"
    click UserModel "https://github.com/jayvaja345/slatesync/blob/main/server/Model/userSchema.js"
    click DocModel "https://github.com/jayvaja345/slatesync/blob/main/server/Model/documentSchema.js"
    click Controllers "https://github.com/jayvaja345/slatesync/blob/main/server/Controller/userController.js"
    click Router "https://github.com/jayvaja345/slatesync/blob/main/server/Routes/Router.js"
    click AuthMW "https://github.com/jayvaja345/slatesync/blob/main/server/middleware/authenticate.js"
    click DocAccessMW "https://github.com/jayvaja345/slatesync/blob/main/server/middleware/documentAccess.js"
    click collab "https://github.com/jayvaja345/slatesync/blob/main/collab-server.js"
    click docSocket "https://github.com/jayvaja345/slatesync/blob/main/server/Sockets/documentSocket.js"
