"use client";
// pages/index.js
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore"; // Updated import
import db from "@/app/firebase/config"; // Ensure correct db import
import { useRouter } from "next/compat/router";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Faq } from "./components/Faq";
import { Pricing } from "./components/Pricing";
import { Cta } from "./components/Cta";
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

	const auth = getAuth();
	const firestore = getFirestore(); // Ensure Firestore instance is initialized

	useEffect(() => {
		const fetchContent = async () => {
			try {
				// Ensure you're passing the correct db instance and collection name
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
		onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		fetchContent();
	}, [auth, firestore]);

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
			{/* <Faq /> */}
			{/* <Pricing /> */}
			{/* <Cta /> */}
			<Footer />
			{/* Hero Section */}
			{/* {heroContent && (
				<section className="hero">
					<h1>{heroContent.title}</h1>
					<p>{heroContent.description}</p>
					<button>{heroContent.cta}</button>
				</section>
			)} */}
			{/* User Greeting and Auth Buttons */}
			{/* <div className="auth">
				{user ? (
					<>
						<p>Welcome, {user.displayName || user.email}!</p>
						<button onClick={handleLogout}>Log Out</button>
					</>
				) : (
					<button onClick={handleLoginRedirect}>Login with Google</button>
				)}
			</div> */}
			{/* Menu Bar */}
			{/* <nav className="menu">
				{menuItems.map((item, index) => (
					<button key={index}>{item.name}</button>
				))}
			</nav> */}
			{/* Testimonials Section */}
			{/* <section className="testimonials">
				<h2>User Testimonials</h2>
				{testimonials.map((testimonial, index) => (
					<blockquote key={index}>
						<p>{testimonial.text}</p>
						<footer>{testimonial.author}</footer>
					</blockquote>
				))}
			</section> */}
			{/* Subscription Form */}
			{/* <section className="subscribe">
				<h2>Stay Updated</h2>
				<form onSubmit={handleSubscribe}>
					<input
						type="email"
						value={subscriptionEmail}
						onChange={(e) => setSubscriptionEmail(e.target.value)}
						placeholder="Your email"
						required
					/>
					<button type="submit">Subscribe</button>
				</form>
				{message && <p>{message}</p>}
			</section> */}
		</div>
	);
};

export default HomePage;
