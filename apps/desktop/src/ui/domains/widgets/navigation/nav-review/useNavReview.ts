/* @layer renderer-widgets @kind hook */
/** Load/persist + screen- and point-level review state for NavReviewPanel. */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { NavReviewData, ScreenReview, PointReview, ReviewStatus } from './types';

const useNavReview = (locationKey: string) => {
  const [reviewData, setReviewData] = useState<NavReviewData>({});
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load review data
  useEffect(() => {
    window.api.loadNavReview().then((d: unknown) => setReviewData((d ?? {}) as NavReviewData));
  }, []);

  const persist = useCallback((next: NavReviewData) => {
    setReviewData(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveNavReview(next), 400);
  }, []);

  const screenReview: ScreenReview = reviewData[locationKey] ?? { status: 'neutral' as ReviewStatus, comment: '', points: {} };

  // Screen-level review
  const setScreenStatus = (status: ReviewStatus) => {
    const next = { ...reviewData, [locationKey]: { ...screenReview, status } };
    persist(next);
  };
  const setScreenComment = (comment: string) => {
    const next = { ...reviewData, [locationKey]: { ...screenReview, comment } };
    persist(next);
  };

  // Point-level review
  const getPointReview = (pointId: string): PointReview => screenReview.points[pointId] ?? { status: 'neutral' };
  const setPointStatus = (pointId: string, status: ReviewStatus) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), status } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointComment = (pointId: string, comment: string) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), comment } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointRequirements = (pointId: string, reqs: string[][]) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), correctedRequirements: reqs } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };
  const setPointTransitType = (pointId: string, transitType: string) => {
    const points = { ...screenReview.points, [pointId]: { ...getPointReview(pointId), correctedTransitType: transitType } };
    const next = { ...reviewData, [locationKey]: { ...screenReview, points } };
    persist(next);
  };

  const toggleExpand = (id: string) => {
    setExpandedPoints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return {
    screenReview, expandedPoints, toggleExpand,
    setScreenStatus, setScreenComment, getPointReview,
    setPointStatus, setPointComment, setPointRequirements, setPointTransitType,
  };
};

export { useNavReview };
