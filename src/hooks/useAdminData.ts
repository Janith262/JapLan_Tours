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

export const useAdminData = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customSites, setCustomSites] = useState<CustomSite[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  useEffect(() => {
    // Real-time listener for Reviews
    const reviewsRef = firestoreCollection(db, "reviews");
    const reviewsQuery = firestoreQuery(reviewsRef, firestoreOrderBy("createdAt", "desc"));
    const unsubscribeReviews = firestoreOnSnapshot(
      reviewsQuery, 
      { includeMetadataChanges: true },
      (snapshot) => {
        const fetchedReviews = snapshot.docs.map(doc => {
          const data = doc.data();
          // Provide a fallback for serverTimestamp while it's pending (null)
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

    // Real-time listener for Sites
    const sitesRef = firestoreCollection(db, "sites");
    const sitesQuery = firestoreQuery(sitesRef, firestoreOrderBy("createdAt", "desc"));
    const unsubscribeSites = firestoreOnSnapshot(
      sitesQuery,
      { includeMetadataChanges: true },
      (snapshot) => {
        const fetchedSites = snapshot.docs.map(doc => {
          const data = doc.data();
          // Provide a fallback for serverTimestamp while it's pending (null)
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

    return () => {
      unsubscribeReviews();
      unsubscribeSites();
    };
  }, []);

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
      createdAt: firestoreServerTimestamp(),
    });
  };

  const deleteSite = async (id: string) => {
    const siteRef = firestoreDoc(db, "sites", id);
    await firestoreDeleteDoc(siteRef);
  };

  return {
    reviews,
    customSites,
    isLoadingReviews,
    isLoadingSites,
    addReview,
    approveReview,
    deleteReview,
    uploadImageToFirestore,
    updateReviewApprovedImages,
    addSite,
    deleteSite,
  };
};
