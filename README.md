# SkillHire Frontend

This frontend is designed for the existing SkillHire MERN project.

## Install

From Client:

npm install react-router-dom
npm run dev

## Existing backend

The frontend expects the Express backend at:

http://localhost:5000

Current API integration:
- POST /api/users/register
- POST /api/users/login
- GET /api/users/profile
- POST /api/projects

The Projects page currently contains demo cards so the professor can immediately see the UI. Replace them with a GET projects endpoint when that backend route is ready.