"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Add onAuthStateChanged import
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/compat/router";
import { auth, firestore } from "@/app/firebase/config"; // Import from config
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";

const HomePage = () => {
	const [heroContent, setHeroContent] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [testimonials, setTestimonials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [subscriptionEmail, setSubscriptionEmail] = useState("");
	const [message, setMessage] = useState("");
	const [user, setUser] = useState(null);
	const router = useRouter();

	useEffect(() => {
		if (user) {
			console.log("use client");
		}

		const fetchContent = async () => {
			try {
				const heroCollection = collection(firestore, "hero");
				const heroSnapshot = await getDocs(heroCollection);
				const heroData = heroSnapshot.docs.map((doc) => doc.data());
				setHeroContent(heroData[0]);

				const menuCollection = collection(firestore, "menu");
				const menuSnapshot = await getDocs(menuCollection);
				const menuData = menuSnapshot.docs.map((doc) => doc.data());
				setMenuItems(menuData);

				const testimonialCollection = collection(firestore, "testimonials");
				const testimonialSnapshot = await getDocs(testimonialCollection);
				const testimonialData = testimonialSnapshot.docs.map((doc) =>
					doc.data()
				);
				setTestimonials(testimonialData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		// Monitor auth state
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		fetchContent();

		// Cleanup the listener when the component is unmounted or when the effect reruns
		return () => unsubscribe();
	}, [auth, firestore, user]);

	const handleSubscribe = async (e) => {
		e.preventDefault();
		if (!user) {
			setMessage("Please log in to subscribe.");
			return;
		}

		try {
			const subscriptionCollection = collection(firestore, "subscriptions");
			await addDoc(subscriptionCollection, {
				email: subscriptionEmail,
				userId: user.uid,
			});
			setMessage("Subscription successful!");
			setSubscriptionEmail("");
		} catch (error) {
			console.error("Error adding subscription:", error);
			setMessage("Subscription failed. Please try again.");
		}
	};

	const handleLogout = () => {
		signOut(auth).then(() => setMessage("Logged out successfully."));
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div>
			<Navbar />
			<Hero />
			<Features />
			<Footer />
		</div>
	);
};

export default HomePage;
