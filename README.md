# SyncScope

A local-first sync inspector UI built with Vue 3, TypeScript, Vite, and InstantDB.

## Features

- 📊 **Real-time sync event monitoring** - View writes, conflicts, and resolutions as they happen
- 🎨 **Beautiful dashboard** - Modern UI with Tailwind CSS styling
- 🔧 **TypeScript support** - Full type safety for better development experience
- 🚀 **Fast development** - Powered by Vite for instant hot reloading
- 📱 **Responsive design** - Works on desktop and mobile devices

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **InstantDB** - Real-time database for local-first applications
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure InstantDB:

   - Sign up at [InstantDB](https://instantdb.com)
   - Create a new project
   - Replace `'your-project-id'` in `src/App.vue` with your actual project ID

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5174](http://localhost:5174) in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── App.vue          # Main application component
├── main.ts          # Application entry point
├── style.css        # Global styles with Tailwind
├── types.ts         # TypeScript type definitions
└── env.d.ts         # Environment type declarations
```

## Data Model

SyncScope monitors sync events with the following structure:

```typescript
interface SyncEvent {
  id: string
  timestamp: number
  type: "write" | "conflict" | "resolved"
  detail: string
}
```

## Development

The application includes mock data for development when InstantDB connection fails. Real-time sync events will appear automatically when connected to a live InstantDB instance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add TypeScript types for new features
5. Test your changes
6. Submit a pull request

## License

MIT License
