"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Firebase config import
import {
	collection,
	getDocs,
	doc,
	getDoc,
	deleteDoc,
	setDoc,
} from "firebase/firestore"; // Firestore methods
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // Heroicons import

export default function DisplayLevelsWithBooks() {
	const [levels, setLevels] = useState([]);
	const [loading, setLoading] = useState(false);

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

	// Handle level deletion with confirmation
	const deleteLevelWithConfirm = async (levelId) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this level?"
		);
		if (confirmDelete) {
			try {
				const levelRef = doc(db, "levels", levelId);
				await deleteDoc(levelRef);
				setLevels((prevLevels) =>
					prevLevels.filter((level) => level.id !== levelId)
				);
			} catch (error) {
				console.error("Error deleting level:", error);
			}
		}
	};

	// Handle book deletion with confirmation
	const deleteBookWithConfirm = async (levelId, bookId) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this book?"
		);
		if (confirmDelete) {
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
			} catch (error) {
				console.error("Error deleting book:", error);
			}
		}
	};

	// Handle page deletion with confirmation
	const deletePageWithConfirm = async (bookId, pageId) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this page?"
		);
		if (confirmDelete) {
			try {
				const bookRef = doc(db, "books", bookId);
				const bookSnap = await getDoc(bookRef);
				if (bookSnap.exists()) {
					const bookData = bookSnap.data();
					const updatedPages = bookData.pages.filter(
						(page) => page.id !== pageId
					);
					await setDoc(bookRef, { ...bookData, pages: updatedPages });
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
												className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-2"
											>
												<PencilIcon className="w-5 h-5" />
												<span>Edit Level</span>
											</button>
											<button
												onClick={() => deleteLevelWithConfirm(level.id)} // Delete with confirmation
												className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
											>
												<TrashIcon className="w-5 h-5" />
												<span>Delete Level</span>
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
																className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-2"
															>
																<PencilIcon className="w-5 h-5" />
																<span>Edit Book</span>
															</button>
															<button
																onClick={() =>
																	deleteBookWithConfirm(level.id, book.id)
																} // Delete book with confirmation
																className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
															>
																<TrashIcon className="w-5 h-5" />
																<span>Delete Book</span>
															</button>
														</div>
													</div>

													<div className="space-y-2 ml-4">
														{book.pages?.map((page) => (
															<div
																key={page.id}
																className="flex justify-between items-center"
															>
																<p className="text-sm text-gray-600">
																	{page.name ||
																		`Page ${book.pages.indexOf(page) + 1}`}
																</p>
																<div className="flex space-x-4">
																	<button
																		onClick={() =>
																			deletePageWithConfirm(book.id, page.id)
																		} // Delete page with confirmation
																		className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2"
																	>
																		<TrashIcon className="w-5 h-5" />
																		<span>Delete Page</span>
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
