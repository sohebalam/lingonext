"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Import Firebase config
import { useRouter } from "next/navigation"; // Import the router
import {
	collection,
	getDocs,
	doc,
	getDoc,
	deleteDoc,
	setDoc,
} from "firebase/firestore"; // Firestore methods
import {
	PencilIcon,
	TrashIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "@heroicons/react/24/solid"; // Heroicons for edit, delete, chevrons
import { Navbar } from "../components/Navbar";

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

	// Handle edit navigation
	const handleEdit = (type, id) => {
		if (type === "level") {
			router.push(`/update/edit-level/${id}`);
		} else if (type === "book") {
			router.push(`/update/edit-book/${id}`);
		} else if (type === "page") {
			router.push(`/update/edit-page/${id}`); // Edit page action
		}
	};

	// Handle book deletion
	const deleteBook = async (levelId, bookId) => {
		const isConfirmed = window.confirm(
			"Are you sure you want to delete this book?"
		);
		if (!isConfirmed) return;

		try {
			const bookRef = doc(db, "books", bookId);
			await deleteDoc(bookRef);
			setLevels((prevLevels) =>
				prevLevels.map((level) =>
					level.id === levelId
						? {
								...level,
								books: level.books.filter((book) => book.id !== bookId),
						  }
						: level
				)
			);
			alert("Book deleted successfully!");
		} catch (error) {
			console.error("Error deleting book:", error);
		}
	};

	// Handle level deletion
	const deleteLevel = async (levelId) => {
		const isConfirmed = window.confirm(
			"Are you sure you want to delete this level?"
		);
		if (!isConfirmed) return;

		try {
			const levelRef = doc(db, "levels", levelId);
			await deleteDoc(levelRef);
			setLevels((prevLevels) =>
				prevLevels.filter((level) => level.id !== levelId)
			);
			alert("Level deleted successfully!");
		} catch (error) {
			console.error("Error deleting level:", error);
		}
	};

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
											<div className="flex space-x-4">
												<button
													onClick={() => handleEdit("level", level.id)} // Edit button for level
													className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-2"
												>
													<PencilIcon className="w-5 h-5" />
													<span>Edit Level</span>
												</button>
												<button
													onClick={() => deleteLevel(level.id)} // Delete button for level
													className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
												>
													<TrashIcon className="w-5 h-5" />
													<span>Delete Level</span>
												</button>
											</div>
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
														<div key={book.id}>
															<div className="flex justify-between items-center">
																<h4 className="text-lg font-medium text-gray-700">
																	{book.name ?? "No title available"}
																</h4>
																<div className="flex space-x-4">
																	<button
																		onClick={() => handleEdit("book", book.id)} // Edit button for book
																		className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-2"
																	>
																		<PencilIcon className="w-5 h-5" />
																		<span>Edit Book</span>
																	</button>
																	<button
																		onClick={() =>
																			deleteBook(level.id, book.id)
																		} // Delete button for book
																		className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
																	>
																		<TrashIcon className="w-5 h-5" />
																		<span>Delete Book</span>
																	</button>
																</div>
															</div>
															<button
																onClick={() => toggleBook(level.id, book.id)} // Toggle book accordion
																className="flex items-center space-x-2 ml-4"
															>
																{expandedBooks[level.id]?.includes(book.id) ? (
																	<ChevronUpIcon className="w-5 h-5" />
																) : (
																	<ChevronDownIcon className="w-5 h-5" />
																)}
															</button>
															{expandedBooks[level.id]?.includes(book.id) && (
																<div className="space-y-2 ml-6">
																	{book.pages?.map((page, index) => (
																		<div
																			key={`${page.id}-${index}`}
																			className="flex justify-between items-center"
																		>
																			<p className="text-sm text-gray-600">
																				Page {index + 1}: {page.name}
																			</p>
																			<div className="flex space-x-4">
																				<button
																					onClick={() =>
																						handleEdit("page", page.id)
																					} // Edit button for page
																					className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-2"
																				>
																					<PencilIcon className="w-5 h-5" />
																					<span>Edit Page</span>
																				</button>
																				<button
																					onClick={() =>
																						deletePage(book.id, page.id)
																					} // Delete button for page
																					className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
																				>
																					<TrashIcon className="w-5 h-5" />
																					<span>Delete Page</span>
																				</button>
																			</div>
																		</div>
																	))}
																</div>
															)}
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
