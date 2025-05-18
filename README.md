# SafeTrack Mobile Application

The SafeTrack mobile application is built with React, Ionic Framework, and Capacitor to provide a robust personal safety solution.

## Features

- Real-time location tracking and sharing
- Emergency SOS with haptic feedback
- Emergency contact management
- Status monitoring (location, battery, connectivity)
- Dark mode support
- Offline capabilities
- Push notifications

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Development Guidelines

### Project Structure

```
safetrack-mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Application pages/routes
│   ├── services/      # API and business logic
│   ├── store/         # Redux store and slices
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── android/          # Android platform files
```

### Key Components

- **QuickSOS**: Emergency button with haptic feedback and hold-to-activate
- **StatusCard**: Real-time status monitoring dashboard
- **EmergencyCard**: Emergency contact and quick actions
- **AppMenu**: Navigation and user settings

### State Management

- Redux for global state management
- Redux Toolkit for simplified Redux logic
- Redux Thunk for async operations

## Testing

### Running Tests

1. Unit Tests:
   ```bash
   npm test
   ```

2. End-to-End Tests:
   ```bash
   npm run test.e2e        # Run all Cypress tests
   npm run test.e2e.open   # Open Cypress interactive mode
   ```

### Test Suites

- **Unit Tests**: Components, services, and utilities
- **E2E Tests**: User flows and integration tests
- **Responsive Tests**: Multi-device compatibility

### Manual Testing Checklist

- Authentication (Login, Register, Password Reset)
- Location Features (Map, Tracking, History)
- SOS Functionality
- Emergency Contacts Management
- Profile Settings
- Battery Monitoring

## Building and Deployment

### Android Build

1. Prepare the build:
   ```bash
   ionic cap sync android
   ```

2. Open in Android Studio:
   ```bash
   ionic cap open android
   ```

### iOS Build

1. Prepare the build:
   ```bash
   ionic cap sync ios
   ```

2. Open in Xcode:
   ```bash
   ionic cap open ios
   ```

## Environment Variables

Create a `.env` file with the following:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_PUSH_KEY=your_push_notification_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Clear node_modules and reinstall
   - Update Ionic CLI and dependencies
   - Check platform-specific requirements

2. **Runtime Errors**
   - Verify API connectivity
   - Check environment variables
   - Ensure proper permissions

3. **Testing Issues**
   - Verify test environment setup
   - Check for API mocking configuration
   - Ensure correct test data

## License

This project is licensed under the MIT License - see the LICENSE file for details.