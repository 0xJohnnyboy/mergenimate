# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mergenimate** is an interactive web app that creates smooth image transitions/morphing animations. Users upload multiple images of identical dimensions, configure animation timings, and generate embeddable code for their animations.

View app in AI Studio: https://ai.studio/apps/drive/14JjtaLYhSn3FxMGXMuty-oTe7kSoCT4V

## Development Commands

### Setup
```bash
npm install
```

Note: Set `GEMINI_API_KEY` in `.env.local` for any AI Studio integrations (though the current codebase doesn't appear to use it directly).

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build
npm test            # Run Vitest tests
```

### Testing
Run specific test file:
```bash
npm test lib/time.test.ts
```

## Architecture

### State Management (Zustand)
The app uses a single Zustand store (`store.ts`) for all global state:
- **Image management**: Upload, validation, reordering, deletion
- **Animation config**: Duration, milestones (percentage or time-based), cycling mode
- **UI state**: Loading, errors, animation playback state

Key store actions:
- `addImages()` - Validates dimensions match before adding (store.ts:59)
- `reorderImages()` - Drag-and-drop reordering (store.ts:100)
- `setMilestoneMode()` - Switch between percentage/time modes with auto-conversion (store.ts:119)

### Feature-Based Organization

The codebase follows a feature-based structure where related functionality is grouped together:

**`features/image-management/`** - Image upload, validation, and thumbnail grid with drag-and-drop
- All images must have identical dimensions - enforced in `services/imageProcessor.ts:13`

**`features/animation-preview/`** - Live animation playback with slider controls
- Animation math: Interpolates between images based on milestone keyframes
- Supports both linear progression and cycling (wrap-around)

**`features/config-panel/`** - Configuration drawer with form validation
- Uses react-hook-form + Zod for validation (`configSchema.ts`)
- Validates milestone ordering and bounds (must be ascending, 0-100%)

**`features/embed-code/`** - Code generation for embedding animations
- Generates self-contained script with inline animation logic (`embedScriptTemplate.ts`)
- Output is a single `<script>` tag with data attributes

### Core Utilities

**`lib/time.ts`** - Duration parsing and formatting
- Supports units: s (seconds), m (minutes), h (hours), d (days)
- Used for both UI display and embed code generation

**`services/imageProcessor.ts`** - Image validation and processing
- Enforces dimension consistency across all uploaded images
- Creates ImageInfo objects with unique IDs for React keys

### Animation System

The animation works on a keyframe interpolation model:
1. Milestones define when each transition point occurs (as % or time)
2. During playback, current position interpolates between keyframes
3. Image opacity is cross-faded based on position between two images
4. Supports linear (A→B→C) or cycling mode (A→B→C→A)

The same logic exists in both:
- Client-side preview (`AnimationPlayer.tsx`)
- Generated embed script (`embedScriptTemplate.ts`)

### TypeScript Configuration

- Strict mode enabled with unused variable/parameter checks
- Uses bundler module resolution (Vite)
- No emit (Vite handles builds)

### Styling

Tailwind CSS v4 (alpha) with dark theme as default. Component styles are co-located with components in `components/ui/`.

## Important Constraints

1. **Image dimensions must match** - First uploaded image sets the reference size
2. **Minimum 2 images required** - Enforced in `store.ts:63`
3. **Milestones must be ascending** - Validated in `configSchema.ts:63`
4. **Duration format required** - Must match regex `(\d+(\.\d+)?)\s*(s|m|h|d)` (configSchema.ts:4)
