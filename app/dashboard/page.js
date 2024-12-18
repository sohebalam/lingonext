"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Import Firebase config
import { useRouter } from "next/navigation"; // Import the router
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore methods
import { Navbar } from "../components/Navbar";
import {
	PencilIcon,
	TrashIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "@heroicons/react/24/solid";

export default function DisplayLevelsWithBooks() {
	const [levels, setLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedLevels, setExpandedLevels] = useState([]); // Track expanded levels
	const [expandedBooks, setExpandedBooks] = useState({}); // Track expanded books
	const router = useRouter(); // Using the router hook

	useEffect(() => {
		const fetchLevels = async () => {
			setLoading(true);

			try {
				// Fetch levels from Firestore
				const levelsSnapshot = await getDocs(collection(db, "levels"));
				console.log("Levels Snapshot:", levelsSnapshot);

				const levelsData = await Promise.all(
					levelsSnapshot.docs.map(async (levelDoc) => {
						const level = { id: levelDoc.id, ...levelDoc.data() };

						console.log("Level Data:", level); // Log each level's data to inspect it

						// Ensure books is always an array, even if undefined or empty
						const bookIds = level.books || []; // Default to an empty array if 'books' is undefined
						console.log("Book IDs:", bookIds); // Log book IDs to check the structure

						// Fetch books associated with the level
						const books = await Promise.all(
							bookIds.map(async (bookId) => {
								const bookRef = doc(db, "books", bookId);
								const bookSnap = await getDoc(bookRef);
								console.log("Book Snapshot:", bookSnap); // Log book snapshot to check data

								return bookSnap.exists()
									? { id: bookSnap.id, ...bookSnap.data() }
									: null;
							})
						);

						// Filter out any null books (in case a book does not exist)
						const validBooks = books.filter((book) => book !== null);

						// Fetch the page data for each book's pages
						for (const book of validBooks) {
							if (book.pages) {
								console.log(`Page IDs for Book ${book.id}:`, book.pages); // Log the page IDs directly

								// Fetch page details for each page ID in the book
								const pageDetails = await Promise.all(
									book.pages.map(async (pageId) => {
										const pageRef = doc(db, "pages", pageId); // Assuming pages are stored in a "pages" collection
										const pageSnap = await getDoc(pageRef);
										return pageSnap.exists()
											? { id: pageSnap.id, ...pageSnap.data() }
											: null;
									})
								);

								console.log("Page Details for Book:", book.id, pageDetails); // Log the page data
								book.pages = pageDetails.filter((page) => page !== null); // Filter out null pages
							} else {
								console.log("No pages in book:", book.id); // Log if no pages exist
							}
						}

						return { ...level, books: validBooks };
					})
				);

				setLevels(levelsData);
			} catch (error) {
				console.error("Error fetching levels:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLevels();
	}, []);

	// Toggle expanded level
	const toggleLevel = (levelId) => {
		setExpandedLevels((prev) =>
			prev.includes(levelId)
				? prev.filter((id) => id !== levelId)
				: [...prev, levelId]
		);
	};

	// Toggle expanded book
	const toggleBook = (levelId, bookId) => {
		setExpandedBooks((prev) => ({
			...prev,
			[levelId]: prev[levelId]?.includes(bookId)
				? prev[levelId].filter((id) => id !== bookId)
				: [...(prev[levelId] || []), bookId],
		}));
	};

	// Navigate to book detail page
	const handleBookClick = (bookId) => {
		router.push(`/book/${bookId}`); // Dynamically push to the book's page
	};

	return (
		<>
			<Navbar />
			<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md space-y-8">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Levels with Books
				</h2>
				{loading ? (
					<p>Loading...</p>
				) : (
					<div className="space-y-6">
						{levels.length > 0 ? (
							levels.map((level) => (
								<div key={level.id} className="space-y-4">
									<div>
										<h3 className="text-xl font-semibold text-gray-800 flex justify-between items-center">
											<span>{level.name}</span>
										</h3>
										<button
											onClick={() => toggleLevel(level.id)} // Toggle level accordion
											className="flex items-center space-x-2"
										>
											{expandedLevels.includes(level.id) ? (
												<ChevronUpIcon className="w-6 h-6" />
											) : (
												<ChevronDownIcon className="w-6 h-6" />
											)}
										</button>
										{expandedLevels.includes(level.id) && (
											<div className="space-y-2">
												{level.books?.length > 0 ? (
													level.books.map((book) => (
														<div
															key={book.id}
															className="flex justify-between items-center cursor-pointer"
															onClick={() => handleBookClick(book.id)} // Add onClick to navigate
														>
															<h4 className="text-lg font-medium text-gray-700">
																{book.name ?? "No title available"}
															</h4>
														</div>
													))
												) : (
													<p>No books available in this level.</p>
												)}
											</div>
										)}
									</div>
								</div>
							))
						) : (
							<p>No levels found.</p>
						)}
					</div>
				)}
			</div>
		</>
	);
}
