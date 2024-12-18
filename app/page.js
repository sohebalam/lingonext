"use client";
import React, { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/compat/router";
// import { auth, firestore } from "@/app/firebase/config"; // Ensure firestore is correctly imported
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
	// const [user, setUser] = useState(null);
	const router = useRouter();

	// useEffect(() => {
	// 	if (user) {
	// 		console.log("use client");
	// 	}

	// 	// Monitor auth state
	// 	const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
	// 		setUser(currentUser);
	// 	});

	// 	// Cleanup the listener when the component is unmounted or when the effect reruns
	// 	return () => unsubscribe();
	// }, [auth, firestore, user]);

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

	// if (loading) return <p>Loading...</p>;

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
