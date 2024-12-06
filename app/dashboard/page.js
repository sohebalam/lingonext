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
} from "firebase/firestore"; // Firestore methods

export default function DisplayLevelsWithBooks() {
	const [levels, setLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter(); // Using the router hook

	// Fetch levels and books
	useEffect(() => {
		const fetchLevels = async () => {
			setLoading(true);

			try {
				// Fetch levels from Firestore
				const levelsSnapshot = await getDocs(collection(db, "levels"));
				const levelsData = await Promise.all(
					levelsSnapshot.docs.map(async (levelDoc) => {
						const level = { id: levelDoc.id, ...levelDoc.data() };

						// Ensure books is always an array, even if undefined or empty
						const bookIds = level.books || []; // Default to an empty array if 'books' is undefined

						// Fetch books associated with the level
						const books = await Promise.all(
							bookIds.map(async (bookId) => {
								const bookRef = doc(db, "books", bookId);
								const bookSnap = await getDoc(bookRef);
								return bookSnap.exists()
									? { id: bookSnap.id, ...bookSnap.data() }
									: null;
							})
						);

						// Filter out any null books (in case a book does not exist)
						const validBooks = books.filter((book) => book !== null);

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
			router.push(`/edit-level/${id}`);
		} else if (type === "book") {
			router.push(`/edit-book/${id}`);
		} else if (type === "page") {
			router.push(`/edit-page/${id}`);
		}
	};

	// Handle book deletion
	const deleteBook = async (levelId, bookId) => {
		try {
			// Delete book from Firestore
			const bookRef = doc(db, "books", bookId);
			await deleteDoc(bookRef);

			// Remove the book from the level's books array
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
		} catch (error) {
			console.error("Error deleting book:", error);
		}
	};

	// Handle level deletion
	const deleteLevel = async (levelId) => {
		try {
			// Delete level from Firestore
			const levelRef = doc(db, "levels", levelId);
			await deleteDoc(levelRef);

			// Remove the level from the state
			setLevels((prevLevels) =>
				prevLevels.filter((level) => level.id !== levelId)
			);
		} catch (error) {
			console.error("Error deleting level:", error);
		}
	};

	// Handle page deletion (if pages are included in books)
	const deletePage = async (bookId, pageId) => {
		try {
			const bookRef = doc(db, "books", bookId);
			const bookSnap = await getDoc(bookRef);

			if (bookSnap.exists()) {
				const bookData = bookSnap.data();
				const updatedPages = bookData.pages.filter(
					(page) => page.id !== pageId
				);

				await setDoc(bookRef, { ...bookData, pages: updatedPages });
				// Remove the page from the displayed book
				setLevels((prevLevels) =>
					prevLevels.map((level) =>
						level.books.map((book) =>
							book.id === bookId
								? {
										...book,
										pages: updatedPages,
								  }
								: book
						)
					)
				);
			}
		} catch (error) {
			console.error("Error deleting page:", error);
		}
	};

	return (
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
										{level.name}
										<div className="flex space-x-4">
											<button
												onClick={() => handleEdit("level", level.id)} // Edit button for level
												className="text-blue-600 hover:text-blue-800"
											>
												Edit Level
											</button>
											<button
												onClick={() => deleteLevel(level.id)} // Delete button for level
												className="text-red-600 hover:text-red-800"
											>
												Delete Level
											</button>
										</div>
									</h3>
									<div className="space-y-2">
										{level.books.length > 0 ? (
											level.books.map((book) => (
												<div key={book.id}>
													<div className="flex justify-between items-center">
														<h4 className="text-lg font-medium text-gray-700">
															{book.name ?? "No title available"}
														</h4>
														<div className="flex space-x-4">
															<button
																onClick={() => handleEdit("book", book.id)} // Edit button for book
																className="text-blue-600 hover:text-blue-800"
															>
																Edit Book
															</button>
															<button
																onClick={() => deleteBook(level.id, book.id)} // Delete button for book
																className="text-red-600 hover:text-red-800"
															>
																Delete Book
															</button>
														</div>
													</div>
													{/* Add the books' pages here */}
													<div className="space-y-2 ml-4">
														{book.pages?.map((page) => (
															<div
																key={page.id}
																className="flex justify-between items-center"
															>
																<p className="text-sm text-gray-600">
																	{page.name}
																</p>
																<div className="flex space-x-4">
																	<button
																		onClick={() => handleEdit("page", page.id)} // Edit button for page
																		className="text-blue-600 hover:text-blue-800"
																	>
																		Edit Page
																	</button>
																	<button
																		onClick={() => deletePage(book.id, page.id)} // Delete button for page
																		className="text-red-600 hover:text-red-800"
																	>
																		Delete Page
																	</button>
																</div>
															</div>
														))}
													</div>
												</div>
											))
										) : (
											<p className="text-gray-600">
												No books assigned to this level
											</p>
										)}
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-gray-600">No levels available.</p>
					)}
				</div>
			)}
		</div>
	);
}
