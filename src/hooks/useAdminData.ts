import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection as firestoreCollection,
  doc as firestoreDoc,
  onSnapshot as firestoreOnSnapshot,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  serverTimestamp as firestoreServerTimestamp,
  query as firestoreQuery,
  orderBy as firestoreOrderBy,
} from "firebase/firestore";
import { sanitizeName, sanitizeLongText } from "@/lib/sanitization";

export type ReviewStatus = "pending" | "approved";

export interface Review {
  id: string;
  name: string;
  country: string;
  city: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: any;
  // Image fields — stored as base64 data URLs directly in Firestore
  images?: string[];           // original uploaded image base64 data URLs
  blurFacesRequested?: boolean;
  approvedImages?: string[];   // final approved (blurred or untouched) image base64 data URLs
}

export interface CustomSite {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  long_description: string;
  nameJa?: string;
  subtitleJa?: string;
  descriptionJa?: string;
  long_descriptionJa?: string;
  image: string;
  createdAt: any;
}

export interface ScheduledTourDay {
  title: string;
  desc: string;
}

export interface ScheduledTourImage {
  imageUrl: string;
  caption: string;
}

export interface ScheduledTour {
  id: string;
  heroImage: string;
  durationDays: string;
  destinations: string;
  priceYen: string;
  days: ScheduledTourDay[];
  gallery: ScheduledTourImage[];
  createdAt: any;
}

export interface AdminDataOptions {
  loadReviews?: boolean;
  loadSites?: boolean;
  loadScheduled?: boolean;
}

export const useAdminData = (options?: AdminDataOptions) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const [scheduledTours, setScheduledTours] = useState<ScheduledTour[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(options?.loadReviews ?? true);
  const [isLoadingSites, setIsLoadingSites] = useState(options?.loadSites ?? true);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(options?.loadScheduled ?? true);

  useEffect(() => {
    let unsubscribeReviews: () => void = () => {};
    let unsubscribeSites: () => void = () => {};
    let unsubscribeScheduled: () => void = () => {};

    if (options?.loadReviews !== false) {
      const reviewsRef = firestoreCollection(db, "reviews");
      const reviewsQuery = firestoreQuery(reviewsRef, firestoreOrderBy("createdAt", "desc"));
      unsubscribeReviews = firestoreOnSnapshot(
        reviewsQuery, 
        { includeMetadataChanges: true },
        (snapshot) => {
          const fetchedReviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt || new Date()
            };
          }) as Review[];
          setReviews(fetchedReviews);
          setIsLoadingReviews(false);
        }
      );
    } else {
      setIsLoadingReviews(false);
    }

    if (options?.loadSites !== false) {
      const sitesRef = firestoreCollection(db, "sites");
      const sitesQuery = firestoreQuery(sitesRef, firestoreOrderBy("createdAt", "desc"));
      unsubscribeSites = firestoreOnSnapshot(
        sitesQuery,
        { includeMetadataChanges: true },
        (snapshot) => {
          const fetchedSites = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt || new Date()
            };
          }) as CustomSite[];
          setCustomSites(fetchedSites);
          setIsLoadingSites(false);
        }
      );
    } else {
      setIsLoadingSites(false);
    }

    if (options?.loadScheduled !== false) {
      const scheduledRef = firestoreCollection(db, "scheduled_tours");
      const scheduledQuery = firestoreQuery(scheduledRef, firestoreOrderBy("createdAt", "desc"));
      unsubscribeScheduled = firestoreOnSnapshot(
        scheduledQuery,
        { includeMetadataChanges: true },
        (snapshot) => {
          const fetchedTours = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt || new Date()
            };
          }) as ScheduledTour[];
          setScheduledTours(fetchedTours);
          setIsLoadingScheduled(false);
        },
        (err) => {
          console.error("Firestore Error on scheduled_tours:", err);
          setIsLoadingScheduled(false);
        }
      );
    } else {
      setIsLoadingScheduled(false);
    }

    return () => {
      unsubscribeReviews();
      unsubscribeSites();
      unsubscribeScheduled();
    };
  }, [options?.loadReviews, options?.loadSites, options?.loadScheduled]);

  // --- REVIEWS METHODS ---
  const addReview = async (
    reviewData: Omit<Review, "id" | "status" | "createdAt"> & {
      images?: string[];
      blurFacesRequested?: boolean;
    }
  ) => {
    const reviewsRef = firestoreCollection(db, "reviews");
    await firestoreAddDoc(reviewsRef, {
      ...reviewData,
      name: sanitizeName(reviewData.name),
      country: sanitizeName(reviewData.country),
      city: sanitizeName(reviewData.city),
      comment: sanitizeLongText(reviewData.comment),
      status: "pending",
      createdAt: firestoreServerTimestamp(),
    });
  };

  const approveReview = async (id: string) => {
    const reviewRef = firestoreDoc(db, "reviews", id);
    await firestoreUpdateDoc(reviewRef, { status: "approved" });
  };

  const deleteReview = async (id: string) => {
    const reviewRef = firestoreDoc(db, "reviews", id);
    await firestoreDeleteDoc(reviewRef);
  };

  /**
   * Upload a base64 data URL directly to a Firestore subcollection.
   * This bypasses Firebase Storage and stores the image data within Firestore.
   * @param reviewId  Firestore review document ID
   * @param base64DataUrl The base64 encoded image data URL
   * @param type      "original" | "approved" to categorize the image
   * @returns         The ID of the newly created subcollection document
   */
  const uploadImageToFirestore = async (
    reviewId: string,
    base64DataUrl: string,
    type: "original" | "approved"
  ): Promise<string> => {
    const imagesSubcollectionRef = firestoreCollection(db, `reviews/${reviewId}/images`);
    const docRef = await firestoreAddDoc(imagesSubcollectionRef, {
      dataUrl: base64DataUrl,
      type: type,
      createdAt: firestoreServerTimestamp(),
    });
    return docRef.id;
  };

  /**
   * Save a set of approved image URLs/data-URLs to a review and mark as approved.
   */
  const updateReviewApprovedImages = async (
    id: string,
    approvedImages: string[]
  ) => {
    const reviewRef = firestoreDoc(db, "reviews", id);
    await firestoreUpdateDoc(reviewRef, {
      approvedImages,
      status: "approved",
    });
  };

  // --- SITES METHODS ---
  const addSite = async (siteData: Omit<CustomSite, "id" | "createdAt">) => {
    const sitesRef = firestoreCollection(db, "sites");
    await firestoreAddDoc(sitesRef, {
      ...siteData,
      name: sanitizeName(siteData.name),
      subtitle: sanitizeName(siteData.subtitle),
      description: sanitizeLongText(siteData.description),
      long_description: sanitizeLongText(siteData.long_description),
      nameJa: siteData.nameJa ? sanitizeName(siteData.nameJa) : undefined,
      subtitleJa: siteData.subtitleJa ? sanitizeName(siteData.subtitleJa) : undefined,
      descriptionJa: siteData.descriptionJa ? sanitizeLongText(siteData.descriptionJa) : undefined,
      long_descriptionJa: siteData.long_descriptionJa ? sanitizeLongText(siteData.long_descriptionJa) : undefined,
      createdAt: firestoreServerTimestamp(),
    });
  };

  const deleteSite = async (id: string) => {
    const siteRef = firestoreDoc(db, "sites", id);
    await firestoreDeleteDoc(siteRef);
  };

  // --- SCHEDULED TOURS METHODS ---
  const addScheduledTour = async (tourData: Omit<ScheduledTour, "id" | "createdAt">) => {
    const toursRef = firestoreCollection(db, "scheduled_tours");
    await firestoreAddDoc(toursRef, {
      ...tourData,
      createdAt: firestoreServerTimestamp(),
    });
  };

  const deleteScheduledTour = async (id: string) => {
    const tourRef = firestoreDoc(db, "scheduled_tours", id);
    await firestoreDeleteDoc(tourRef);
  };

  const updateScheduledTour = async (id: string, tourData: Partial<Omit<ScheduledTour, "id" | "createdAt">>) => {
    const tourRef = firestoreDoc(db, "scheduled_tours", id);
    await firestoreUpdateDoc(tourRef, tourData);
  };

  return {
    reviews,
    customSites,
    scheduledTours,
    isLoadingReviews,
    isLoadingSites,
    isLoadingScheduled,
    addReview,
    approveReview,
    deleteReview,
    uploadImageToFirestore,
    updateReviewApprovedImages,
    addSite,
    deleteSite,
    addScheduledTour,
    updateScheduledTour,
    deleteScheduledTour,
  };
};
