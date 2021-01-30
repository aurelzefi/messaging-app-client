# Messaging App Client

The desktop and web client for a messaging app.

## Setup
```
npm install
```

## Configuration

Create a `.env.development.local` environment file with the following values:

```dotenv
VUE_APP_API_URL=your-api-endpoint
VUE_APP_PUSHER_APP_KEY=key
VUE_APP_WS_HOST=your-websockets-host
```

### Compiles and hot-reloads for development as a web app
```
npm run serve
```

### Compiles and hot-reloads for development as a desktop app
```
npm run electron:serve
```

### Generates icons for the desktop app
```
npm run electron:generate-icons
```

### Compiles and minifies for production as a web app
```
npm run build
```

### Compiles and minifies for production as a desktop app
```
npm run electron:build
```

### Demo

A video demo of this application can be found [here]().
