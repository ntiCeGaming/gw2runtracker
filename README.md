# GW2 Raid Tracker

A performance tracking application for Guild Wars 2 raid teams, specifically designed for the "Snow Crows" team practicing for tournaments.

## Features

### Raid Tracking
- **Live Timer**: Automatically starts when significant movement is detected in-game after pressing the start button
- **Split Timers**: Track individual steps and phases within raid wings
- **Death Tracking**: Record where and when team members died during runs
- **Run Controls**: Pause, resume, complete, or mark a run as failed

### Performance Analysis
- **Run History**: View all past raid runs with filtering and sorting options
- **Analytics**: Visualize performance trends over time
- **Comparison**: Compare runs against each other to identify improvements

### Customization
- **Raid Wings**: Configure raid wings and their steps
- **Team Management**: Track which team members participated in each run
- **Data Export**: Export your raid data for backup or sharing

## Getting Started

### Prerequisites
- Node.js and npm installed on your system

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Usage

### Starting a Raid Run
1. Navigate to the Raid Tracker page
2. Select a raid wing
3. Enter team member names
4. Click "Start Run"
5. The timer will automatically start when movement is detected in-game

### Recording Steps and Deaths
- Click "Record Step" when you reach a significant point in the raid
- Click "Record Death" and select a team member when someone dies

## Deployment

This application can be deployed online so that anyone can access it. For detailed instructions on how to deploy to various hosting platforms (Netlify, Vercel, GitHub Pages), please see the [Deployment Guide](DEPLOYMENT.md).

### Viewing History and Analytics
- Navigate to the History page to view past runs
- Use the Analytics page to visualize performance trends

## Customization

### Adding or Editing Raid Wings
1. Navigate to the Settings page
2. Select the "Raid Wings" tab
3. Fill in the wing details and click "Add Wing" or "Update Wing"

### Adding or Editing Steps
1. Navigate to the Settings page
2. Select the "Raid Steps" tab
3. Select a wing, fill in the step details, and click "Add Step" or "Update Step"


## License

This project is licensed under the MIT License - see the LICENSE file for details.
