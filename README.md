# Linsta - Professional Social Networking App

A modern, feature-rich social networking application built with React Native and Expo, combining the best features of LinkedIn and Instagram for professional networking and event discovery.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0.30-000020.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)

## 🌟 Features

### 📱 Core Features
- **Social Feed** - LinkedIn-style professional feed with posts, images, and interactions
- **Video Reels** - Instagram-style short-form video content with auto-play
- **Stories** - Full-screen story viewer with photo/text support, likes, and comments
- **Events Discovery** - Browse, search, and filter professional events
- **Event Management** - Create and manage events with multi-step forms
- **User Authentication** - Complete auth flow with login, signup, and OTP verification

### 🎨 UI/UX Highlights
- Instagram-inspired story viewer with navigation arrows
- LinkedIn-themed professional interface
- Smooth animations and transitions
- Dark mode story viewer
- Responsive design for all screen sizes
- Native date/time pickers for event scheduling

### 🔐 Authentication & User Management
- Email/Password login with validation
- OAuth support (Google, Microsoft, LinkedIn)
- OTP email verification (6-digit code)
- User state management (New, Returning, Incomplete Profile, Suspended, Restricted)
- Permission-based screen access
- Profile completion flow

### 📅 Events System
- Event discovery with search and filters
- Category-based filtering (Networking, Workshop, Conference, etc.)
- Event details with RSVP functionality
- Multi-step event creation:
  - Basic Information
  - Schedule & Location
  - Media & Publish
- Native date/time pickers

### 📖 Stories
- Full-screen story viewer
- Photo and text story support
- Progress bars with auto-advance
- Like and comment functionality
- Navigation arrows and tap gestures
- Instagram-style UI with dark theme

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CubeAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npx expo start
```

4. **Run on your device**
- Scan the QR code with Expo Go app (iOS/Android)
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web (requires additional setup)

## 📁 Project Structure

```
CubeAI/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNavigation.tsx
│   │   ├── EventCard.tsx
│   │   ├── FilterChip.tsx
│   │   ├── PostCard.tsx
│   │   ├── StoryCarousel.tsx
│   │   ├── StoryViewer.tsx
│   │   └── VideoReel.tsx
│   ├── context/            # React Context providers
│   │   └── UserContext.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── OTPVerificationScreen.tsx
│   │   │   └── OAuthSelectionScreen.tsx
│   │   ├── events/        # Event-related screens
│   │   │   ├── EventsDiscoveryScreen.tsx
│   │   │   ├── EventDetailScreen.tsx
│   │   │   └── CreateEventScreen.tsx
│   │   ├── home/          # Home feed screen
│   │   │   └── HomeScreen.tsx
│   │   ├── RestrictedAccessScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── userTypes.ts
│   └── utils/             # Utility functions and data
│       ├── eventMockData.ts
│       ├── eventTypes.ts
│       ├── mockData.ts
│       └── types.ts
├── assets/                # Static assets
│   ├── images/           # Image files
│   └── videos/           # Video files
├── App.tsx               # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🎯 Key Components

### StoryViewer
Full-screen Instagram-style story viewer with:
- Photo and text story support
- Progress bars with auto-advance (5s per story)
- Like/comment functionality
- Navigation arrows and tap gestures
- Dark theme with semi-transparent overlays

### VideoReel
Video playback component with:
- Auto-play when visible
- Native video controls
- View count badge
- Seamless integration with feed

### EventCard
Event display component featuring:
- Event image and details
- Category badges
- Date/time/location info
- RSVP and bookmark actions

### UserContext
Centralized user state management:
- Authentication state
- User profile data
- Permission checking
- Login/logout functionality

## 🔑 Test Credentials

### Development Login
- **Email:** `bhupesh@gmail.com`
- **Password:** `1234567`

### Test Scenarios
- `new@example.com` → New user flow
- `incomplete@example.com` → Profile incomplete
- `suspended@example.com` → Account suspended
- `restricted@example.com` → Limited access

### OTP Verification
- Valid code: `123456`
- Expired code: `000000`
- Any other code: Invalid

## 🛠️ Technologies Used

- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Custom navigation system
- **State Management:** React Context API
- **Video:** expo-av
- **Icons:** @expo/vector-icons
- **UI Components:** React Native core components

## 📦 Dependencies

### Core
- `expo` - Expo platform
- `react` - React library
- `react-native` - React Native framework
- `typescript` - TypeScript support

### UI & Navigation
- `@expo/vector-icons` - Icon library
- `react-native-safe-area-context` - Safe area handling
- `react-native-gesture-handler` - Gesture support
- `react-native-screens` - Native screen optimization

### Features
- `expo-av` - Audio/Video playback
- `@react-native-community/datetimepicker` - Native date/time pickers
- `expo-status-bar` - Status bar control

## 🎨 Design System

### Colors
- **Primary:** `#0a66c2` (LinkedIn Blue)
- **Error:** `#ed4956` (Instagram Red)
- **Success:** `#4caf50`
- **Background:** `#fff` / `#000` (Light/Dark)
- **Text:** `#262626` / `#fff`

### Typography
- **Headings:** Bold, 24-28px
- **Body:** Regular, 14-16px
- **Captions:** 12-13px

## 🚧 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] Profile customization
- [ ] Advanced search filters
- [ ] Event recommendations
- [ ] Social sharing
- [ ] Analytics dashboard

## 📝 Development Notes

### Adding Story Images
Place images in `assets/images/` and reference them:
```typescript
imageUri: require('../../assets/images/story1.jpg')
```

### Adding Videos
Place videos in `assets/videos/` and reference them:
```typescript
videoUri: require('../../assets/videos/video1.mp4')
```

### User State Flow
```
Splash → Login → (Auth Check) → Home/Restricted
                ↓
              Signup → OTP → Home
```

## 🐛 Known Issues

- Web support requires additional configuration
- Some animations may not work on older devices
- Video playback performance varies by device

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Development Team

## 📞 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ using React Native and Expo**
