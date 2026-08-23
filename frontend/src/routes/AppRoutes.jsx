import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PlanTripPage from '../pages/PlanTripPage';
import NearbyPage from '../pages/NearbyPage';
import ProfilePage from '../pages/ProfilePage';
import MobilityPage from '../pages/MobilityPage';
import TourismPage from '../pages/TourismPage';
import ExplorePage from '../pages/ExplorePage';
import PlanBuilderPage from '../pages/PlanBuilderPage';
import RoutesBuilderPage from '../pages/RouteBuilderPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('wondergdl_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/tourism" element={<TourismPage />} />
      <Route path="/mobility" element={<MobilityPage />} />
      <Route path="/plan" element={<PlanTripPage />} />
      <Route path="/plan/new" element={<PlanBuilderPage />} />
      <Route path="/routes/new" element={<RoutesBuilderPage />} />
      <Route path="/nearby" element={<NearbyPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}