# Deployment Guide

Guide for deploying the Employee PDF Template System to production.

## Build for Production

```bash
cd react-app
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd react-app
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd react-app
netlify deploy --prod --dir=dist
```

#### GitHub Pages

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

### Option 2: Traditional Web Server (Apache, Nginx)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /templates {
        alias /path/to/templates;
    }
}
```

#### Apache Configuration (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t employee-pdf-system .
docker run -p 80:80 employee-pdf-system
```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://your-api.com
VITE_TEMPLATES_PATH=/templates
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Template Management in Production

### Option 1: CDN/Static Storage

Store templates in a CDN or cloud storage:

```javascript
// Update loadTemplate in templateProcessor.js
export async function loadTemplate(fileName) {
  const baseUrl = import.meta.env.VITE_TEMPLATES_CDN;
  const response = await fetch(`${baseUrl}/${fileName}`);
  return await response.text();
}
```

### Option 2: Database Storage

Store templates in a database and fetch via API:

```javascript
export async function loadTemplate(templateId) {
  const response = await fetch(`/api/templates/${templateId}`);
  const data = await response.json();
  return data.content;
}
```

### Option 3: Bundle with App

For small number of templates, bundle them:

```javascript
// Import templates directly
import template1 from './templates/template1.html?raw';
import template2 from './templates/template2.html?raw';

const templates = {
  'template1.html': template1,
  'template2.html': template2,
};

export async function loadTemplate(fileName) {
  return templates[fileName];
}
```

## Security Considerations

### 1. Sanitize User Input

```javascript
import DOMPurify from 'dompurify';

const cleanHtml = DOMPurify.sanitize(userInput);
```

### 2. HTTPS Only

Enforce HTTPS in production:

```javascript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### 3. Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline';">
```

### 4. API Authentication

If using an API for templates:

```javascript
const response = await fetch('/api/templates', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Performance Optimization

### 1. Code Splitting

Vite automatically code-splits. You can also use dynamic imports:

```javascript
const DocumentEditor = lazy(() => import('./components/DocumentEditor'));
```

### 2. Image Optimization

Optimize logos and images before deployment:

```bash
npm install -D vite-plugin-image-optimizer
```

### 3. Compression

Enable gzip/brotli compression on your server.

Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 4. Caching

Set cache headers for static assets:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring

### Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: "production"
});
```

### Analytics

Add Google Analytics or Plausible:

```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Backup Strategy

### 1. Employee Data

Regular backups of `employees.json`:

```bash
# Cron job
0 2 * * * cp /path/to/employees.json /backups/employees-$(date +\%Y\%m\%d).json
```

### 2. Templates

Version control templates with Git:

```bash
git add public/templates/
git commit -m "Update templates"
git push
```

### 3. Database (if applicable)

Automated database backups:

```bash
# PostgreSQL example
pg_dump dbname > backup-$(date +\%Y\%m\%d).sql
```

## Rollback Plan

Keep previous build versions:

```bash
# Before deploying
mv dist dist.backup-$(date +\%Y\%m\%d)

# If issues occur, rollback
rm -rf dist
mv dist.backup-YYYYMMDD dist
```

## Health Checks

Create a health check endpoint:

```javascript
// Add to your API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## Scaling Considerations

### Load Balancing

Use multiple instances behind a load balancer:

```nginx
upstream pdf_system {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### CDN

Use a CDN for static assets:
- Cloudflare
- AWS CloudFront
- Fastly

## Troubleshooting Production Issues

### Check build output

```bash
npm run build -- --debug
```

### Preview production build locally

```bash
npm run preview
```

### Check for errors

```bash
# Server logs
tail -f /var/log/nginx/error.log

# Application logs (if using PM2)
pm2 logs
```

## Maintenance Mode

Create a maintenance page and configure your server to serve it:

```html
<!-- maintenance.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance</title>
</head>
<body>
  <h1>We'll be back soon!</h1>
  <p>The system is undergoing maintenance.</p>
</body>
</html>
```

Nginx:
```nginx
if (-f $document_root/maintenance.html) {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    rewrite ^(.*)$ /maintenance.html break;
}
```

## Post-Deployment Checklist

- [ ] Test all features in production
- [ ] Verify template loading
- [ ] Test PDF generation
- [ ] Check print functionality
- [ ] Verify employee data loads correctly
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Verify HTTPS is working
- [ ] Test error handling
- [ ] Monitor server resources
- [ ] Set up alerting
- [ ] Document any issues
- [ ] Train users on the system
