# vClock

A premium, responsive, full-stack web application providing Clock, Stopwatch, Timer, and Alarm functionality, built with a separated client/server architecture.

## Features

- **Modular UI Logic**: Cleanly separated files for Alarm, Timer, Stopwatch, and general Application state.
- **Stopwatch**: Precision millisecond stopwatch rendering smoothly at 60 FPS using `requestAnimationFrame`.
- **Timer & Alarm (In Development)**: Future proof layout ready for timer countdowns and robust audio-triggered alarms.
- **Preloaded Audio Assets**: Guarantees alarm audio triggers with zero delay.
- **Local Storage Persistence**: Automatically remembers your settings, including layout preferences, dark/light theme options, 7-segment digital font selection, and UI accent colors.
- **Settings Panel**: Sliding menu to heavily customize the visual appearance of the application instantly without a refresh.

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6)
- **Icons**: Lucide Icons
- **Fonts**: Inter (UI text), Orbitron (Digital Time Display)

## Local Installation

To run this project locally, execute the following commands in your terminal:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd vclock-project
   ```

2. **Install strictly required dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open your browser and navigate to exactly:
   [http://localhost:3000](http://localhost:3000) (or via the dynamically assigned `PORT` outputted in your console).
