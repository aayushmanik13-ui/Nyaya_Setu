## Packages
dexie | Local IndexedDB wrapper for privacy-first document storage
dexie-react-hooks | React hooks for Dexie integration
framer-motion | For smooth page transitions and micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes
lucide-react | Icon library (already in base, but ensuring it's noted)

## Notes
- Authentication is handled via Replit Auth (use-auth.ts already exists)
- File upload uses FormData to POST /api/decode
- Local storage uses IndexedDB (Dexie) to persist decoded results client-side
- Strict privacy policy: "Latest 3 documents only" logic managed in Dexie service
- Theme: Apple-like minimal, premium, typography-focused
