# Lensifyr - AI-Powered Photography Studio Platform

## Original Problem Statement
Build a complete React frontend for Lensifyr, an AI-powered photography studio management platform with face recognition. Backend (Node.js + Python microservice) already exists externally. Frontend should use RK Editorial Gold theme (black/brown/grey with gold accents), Cormorant Garamond + DM Sans fonts, hyperspeed starfield animation on landing page, split-layout auth pages with provided images.

## Architecture
- **Frontend**: React (CRA + Craco) + Tailwind CSS + shadcn/ui + Inline styles with gold theme tokens
- **Backend**: FastAPI (Python) with MongoDB (motor) - implements matching API endpoints from the Node.js API reference
- **External Backend**: Node.js Express (user's actual backend) + Python face recognition microservice (ArcFace/RetinaFace)
- **Database**: MongoDB (organizers, events, images, image_data collections)
- **Auth**: JWT tokens (Bearer header), bcrypt password hashing

## User Personas
1. **Organizer/Photographer** - Manages studio, creates events, uploads photos, views stats
2. **Guest/Attendee** - Searches for studio, enters event code, finds their photos via selfie match

## Core Requirements
- Landing page with hyperspeed starfield canvas animation
- Auth (register/login) with split layout (image left, form right)
- Organizer dashboard with banner, stats, recent events, quick actions
- Event management (create, list, search, delete, copy code)
- Photo upload with drag-and-drop
- Find Photos public wizard (search studio → select event → enter code → browse/selfie match)
- Profile management with studio ID sharing
- Settings page
- 404 page with provided error image
- All pages use RK Editorial Gold dark theme

## What's Been Implemented (Jan 2026)
- [x] Full FastAPI backend with all API endpoints matching the API reference
- [x] JWT authentication (register, login, logout, profile update)
- [x] Event CRUD with auto-generated event codes
- [x] Image upload with MongoDB storage (face detection MOCKED)
- [x] Image matching endpoints (MOCKED - returns random scores)
- [x] Landing page with hyperspeed canvas starfield animation
- [x] Register page - split layout with provided studio image
- [x] Login page - split layout with provided studio image
- [x] Dashboard with banner image, stat cards, quick actions, recent events
- [x] Events page with search, grid layout, copy code, delete
- [x] Create Event page with success state showing generated code
- [x] Upload page with event selector and drag-and-drop zone
- [x] Profile page with studio ID display and edit form
- [x] Settings page (appearance, account, about)
- [x] Find Photos 4-step wizard (search, events, verify code, browse/selfie)
- [x] 404 page with provided error image
- [x] Protected routes with auth guards
- [x] Responsive design (mobile + desktop)

## Testing Status
- Backend: 100% (12/12 endpoints)
- Frontend: 95%+ (all flows working)

## MOCKED Features
- Face recognition (upload returns random face count)
- Image matching (preview-matches returns mock similarity scores)
- ZIP download (find-matches returns mock ZIP with random images)

## Prioritized Backlog
### P0 (Critical)
- Connect to actual Node.js backend + Python microservice (replace FastAPI proxy)

### P1 (High)
- Real Cloudinary image upload integration
- Actual face recognition with ArcFace/RetinaFace
- Event detail page with gallery management
- Change password functionality

### P2 (Medium)
- Studio public profile page (/organizer/:id)
- Event cover image upload
- Real-time upload progress with WebSocket
- Organizer search from Find Photos page

### P3 (Nice to have)
- Dark/light mode toggle
- Delete account
- Rate limiting
- Email notifications for matched photos

## Next Tasks
1. Connect frontend to actual Node.js backend
2. Implement real Cloudinary uploads
3. Wire up Python face recognition microservice
4. Add event detail page with gallery
5. Implement password change flow
