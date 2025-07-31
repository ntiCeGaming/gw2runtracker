# Deployment Guide for GW2 Raid Tracker

This guide will help you deploy the GW2 Raid Tracker application to various hosting platforms so it can be accessed online by anyone.

## Prerequisites

- Node.js and npm installed on your local machine
- Git installed on your local machine (optional, but recommended)
- A GitHub account (for GitHub Pages deployment)
- A Netlify, Vercel, or similar account (for alternative deployment options)

## Build the Application

Before deploying, you need to build the application:

```bash
npm run build-all
```

This will create a `dist` directory with all the necessary files for deployment.

## Deployment Options

### Option 1: Deploy to Netlify

1. **Sign up for Netlify**
   - Go to [Netlify](https://www.netlify.com/) and sign up for an account

2. **Deploy from the Netlify UI**
   - Log in to your Netlify account
   - Click on "New site from Git" or drag and drop your `dist` folder onto the Netlify UI
   - If using Git, connect your repository and set the build command to `npm run build-all` and the publish directory to `dist`
   - If using drag and drop, simply upload your `dist` folder

3. **Configure Netlify**
   - The `netlify.toml` file in your project already contains the necessary configuration
   - This includes a redirect rule to handle client-side routing

### Option 2: Deploy to Vercel

1. **Sign up for Vercel**
   - Go to [Vercel](https://vercel.com/) and sign up for an account

2. **Install Vercel CLI (optional)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy using Vercel**
   - Using the UI: Import your GitHub repository and set the build command to `npm run build-all` and the output directory to `dist`
   - Using the CLI: Run `vercel` in your project directory and follow the prompts

4. **Configure Vercel for SPA**
   - Create a `vercel.json` file in your project root with the following content:
   ```json
   {
     "routes": [
       { "handle": "filesystem" },
       { "src": "/.*", "dest": "/index.html" }
     ]
   }
   ```

### Option 3: Deploy to GitHub Pages

1. **Create a GitHub repository**
   - Push your code to a GitHub repository

2. **Configure for GitHub Pages**
   - The repository is already configured with the necessary scripts and targets in `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build-all",
     "deploy": "gh-pages -d dist",
     "predeploy-subdir": "npm run build-subdir",
     "deploy-subdir": "npm run predeploy-subdir && gh-pages -d dist"
   },
   "targets": {
     "default": {
       "publicUrl": "/"
     },
     "subdir": {
       "publicUrl": "/gw2runtracker"
     }
   }
   ```
   - The gh-pages package is already installed as a development dependency

3. **Deploy to GitHub Pages**
   - For deployment to the root of your GitHub Pages site:
   ```bash
   npm run deploy
   ```
   - For deployment to a subdirectory (recommended for GitHub Pages):
   ```bash
   npm run deploy-subdir
   ```
   This will build the application with the proper subdirectory path (`/gw2runtracker`) using the Parcel target configuration and deploy it to the gh-pages branch.

4. **Configure GitHub Pages**
   - Go to your repository settings
   - Scroll down to the GitHub Pages section
   - Select the `gh-pages` branch as the source

## Important Notes

### Client-Side Storage

This application uses IndexedDB for client-side storage. This means:

- All data is stored in the user's browser
- Data will not be shared between users or devices
- If a user clears their browser data, their raid tracking data will be lost

### Cross-Origin Restrictions

If you're embedding this application in another website or accessing it from a different domain, be aware of potential cross-origin restrictions that might affect IndexedDB functionality.

## Troubleshooting

### Routing Issues

If you encounter 404 errors when navigating directly to routes (e.g., `/settings`), make sure your hosting provider is configured to serve the `index.html` file for all routes. This is already configured in the `netlify.toml` file for Netlify deployments.

### Subdirectory Deployment

The application has been configured to support deployment in subdirectories:

- The `BrowserRouter` in `index.tsx` uses a dynamic basename that reads from `process.env.PUBLIC_URL` or defaults to `/`
- All utility HTML files (like `resetDb.html`, `updateDb.html`, etc.) use relative paths for navigation instead of absolute paths
- If you're deploying to a subdirectory, you can use the provided build script:

```bash
npm run build-subdir
```

This script uses Parcel's target configuration to set the `publicUrl` to `/gw2runtracker` and builds the application. You can modify the `publicUrl` in the `targets.subdir` section of `package.json` to use a different subdirectory path if needed.

### Build Issues

If you encounter issues during the build process:

1. Make sure all dependencies are installed: `npm install`
2. Clear the Parcel cache: `rm -rf .parcel-cache` (or delete the `.parcel-cache` directory manually)
3. Try building again: `npm run build-all`

## Support

If you encounter any issues with deployment, please open an issue in the GitHub repository or contact the maintainer.