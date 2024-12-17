"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/app/firebase/config";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation"; // For redirecting to login if not admin

const AdminPage = () => {
	const [user, setUser] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [content, setContent] = useState({
		hero: {},
		menu: [],
		testimonials: [],
	});
	const [loading, setLoading] = useState(true);
	const [newHero, setNewHero] = useState({ title: "", description: "" });
	const [newMenu, setNewMenu] = useState("");
	const [newTestimonial, setNewTestimonial] = useState({
		text: "",
		author: "",
	});
	const router = useRouter(); // For redirecting to login if not admin

	useEffect(() => {
		const auth = getAuth();
		const fetchContent = async () => {
			try {
				const heroSnapshot = await getDocs(collection(db, "hero"));
				const heroData = heroSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}))[0];

				const menuSnapshot = await getDocs(collection(db, "menu"));
				const menuData = menuSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				const testimonialsSnapshot = await getDocs(
					collection(db, "testimonials")
				);
				const testimonialsData = testimonialsSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setContent({
					hero: heroData,
					menu: menuData,
					testimonials: testimonialsData,
				});
			} catch (error) {
				console.error("Error fetching content:", error);
			} finally {
				setLoading(false);
			}
		};

		onAuthStateChanged(auth, async (currentUser) => {
			if (currentUser) {
				setUser(currentUser);

				// Check if the user is an admin by looking up their document
				const userDoc = doc(db, "users", currentUser.uid);
				const userSnapshot = await getDoc(userDoc);

				if (userSnapshot.exists()) {
					const userData = userSnapshot.data();
					setIsAdmin(userData.isAdmin); // Set isAdmin flag

					if (!userData.isAdmin) {
						router.push("/"); // Redirect non-admins to the homepage
					} else {
						fetchContent(); // Only fetch content if the user is an admin
					}
				}
			} else {
				router.push("/login"); // Redirect unauthenticated users to login page
			}
		});
	}, [router]);

	const handleHeroSubmit = async (e) => {
		e.preventDefault();
		try {
			const heroRef = doc(db, "hero", "heroDocId"); // Adjust to the appropriate doc ID
			await setDoc(heroRef, newHero);
			setContent((prevContent) => ({
				...prevContent,
				hero: newHero,
			}));
			setNewHero({ title: "", description: "" });
		} catch (error) {
			console.error("Error updating hero:", error);
		}
	};

	const handleMenuSubmit = async (e) => {
		e.preventDefault();
		try {
			const menuRef = collection(db, "menu");
			await setDoc(doc(menuRef), { name: newMenu });
			setContent((prevContent) => ({
				...prevContent,
				menu: [...prevContent.menu, { name: newMenu }],
			}));
			setNewMenu("");
		} catch (error) {
			console.error("Error updating menu:", error);
		}
	};

	const handleTestimonialSubmit = async (e) => {
		e.preventDefault();
		try {
			const testimonialsRef = collection(db, "testimonials");
			await setDoc(doc(testimonialsRef), newTestimonial);
			setContent((prevContent) => ({
				...prevContent,
				testimonials: [...prevContent.testimonials, newTestimonial],
			}));
			setNewTestimonial({ text: "", author: "" });
		} catch (error) {
			console.error("Error updating testimonial:", error);
		}
	};

	if (loading) {
		return <div>Loading...</div>; // Simple loading state
	}

	if (!isAdmin) {
		return <div>You do not have access to this page.</div>; // Show access denied message
	}

	return (
		<div>
			<h1>Admin Page</h1>

			<section>
				<h2>Hero Section</h2>
				<div>{content.hero?.title || "No Hero Content Available"}</div>
				<form onSubmit={handleHeroSubmit}>
					<input
						type="text"
						placeholder="Hero Title"
						value={newHero.title}
						onChange={(e) => setNewHero({ ...newHero, title: e.target.value })}
					/>
					<textarea
						placeholder="Hero Description"
						value={newHero.description}
						onChange={(e) =>
							setNewHero({ ...newHero, description: e.target.value })
						}
					/>
					<button type="submit">Update Hero</button>
				</form>
			</section>

			<section>
				<h2>Menu Items</h2>
				<ul>
					{content.menu?.map((item, index) => (
						<li key={item.id || index}>{item.name}</li> // Use index if no id available
					))}
				</ul>
				<form onSubmit={handleMenuSubmit}>
					<input
						type="text"
						placeholder="New Menu Item"
						value={newMenu}
						onChange={(e) => setNewMenu(e.target.value)}
					/>
					<button type="submit">Add Menu Item</button>
				</form>
			</section>

			<section>
				<h2>Testimonials</h2>
				<ul>
					{content.testimonials?.map((testimonial, index) => (
						<li key={testimonial.id || index}>
							{" "}
							{/* Fallback to index if id is not available */}
							<blockquote>"{testimonial.text}"</blockquote>
							<footer>- {testimonial.author}</footer>
						</li>
					))}
				</ul>

				<form onSubmit={handleTestimonialSubmit}>
					<textarea
						placeholder="Testimonial Text"
						value={newTestimonial.text}
						onChange={(e) =>
							setNewTestimonial({ ...newTestimonial, text: e.target.value })
						}
					/>
					<input
						type="text"
						placeholder="Author Name"
						value={newTestimonial.author}
						onChange={(e) =>
							setNewTestimonial({ ...newTestimonial, author: e.target.value })
						}
					/>
					<button type="submit">Add Testimonial</button>
				</form>
			</section>
		</div>
	);
};

export default AdminPage;
