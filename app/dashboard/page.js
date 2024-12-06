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

export default function DisplayLevelsWithBooks() {
	const [levels, setLevels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation dialog state
	const [itemToDelete, setItemToDelete] = useState(null); // Item to delete (level, book, or page)
	const [expandedLevel, setExpandedLevel] = useState(null); // Expanded level state
	const [expandedBook, setExpandedBook] = useState(null); // Expanded book state
	const [selectedPage, setSelectedPage] = useState(null); // Selected page state

	// Fetch levels and associated books from Firestore
	useEffect(() => {
		const fetchLevels = async () => {
			setLoading(true);

			try {
				// Fetch levels from Firestore
				const levelsSnapshot = await getDocs(collection(db, "levels"));
				const levelsData = await Promise.all(
					levelsSnapshot.docs.map(async (levelDoc) => {
						const level = { id: levelDoc.id, ...levelDoc.data() };
						const bookIds = level.books || []; // Ensure books is an array
						const books = await Promise.all(
							bookIds.map(async (bookId) => {
								const bookRef = doc(db, "books", bookId);
								const bookSnap = await getDoc(bookRef);
								return bookSnap.exists()
									? { id: bookSnap.id, ...bookSnap.data() }
									: null;
							})
						);
						return { ...level, books: books.filter((book) => book !== null) };
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

	// Delete a book from a level
	const deleteBook = async (levelId, bookId) => {
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
	};

	// Delete a level
	const deleteLevel = async (levelId) => {
		try {
			const levelRef = doc(db, "levels", levelId);
			await deleteDoc(levelRef);

			setLevels((prevLevels) =>
				prevLevels.filter((level) => level.id !== levelId)
			);
		} catch (error) {
			console.error("Error deleting level:", error);
		}
	};

	// Delete a page from a book
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

				// Update the displayed levels and books after deletion
				setLevels((prevLevels) =>
					prevLevels.map((level) =>
						level.books.map((book) =>
							book.id === bookId ? { ...book, pages: updatedPages } : book
						)
					)
				);
			}
		} catch (error) {
			console.error("Error deleting page:", error);
		}
	};

	// General delete handler (based on item type: level, book, page)
	const handleDelete = () => {
		if (itemToDelete.type === "level") {
			deleteLevel(itemToDelete.id);
		} else if (itemToDelete.type === "book") {
			deleteBook(itemToDelete.levelId, itemToDelete.id);
		} else if (itemToDelete.type === "page") {
			deletePage(itemToDelete.bookId, itemToDelete.id);
		}

		setShowConfirmation(false);
		setItemToDelete(null);
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
									<h3
										className="text-xl font-semibold text-gray-800 cursor-pointer flex justify-between items-center"
										onClick={() =>
											setExpandedLevel(
												expandedLevel === level.id ? null : level.id
											)
										}
									>
										{level.name}
										<button
											onClick={() => {
												setShowConfirmation(true);
												setItemToDelete({ id: level.id, type: "level" });
											}}
											className="text-red-600 hover:text-red-800"
										>
											Delete Level
										</button>
									</h3>
									{expandedLevel === level.id && (
										<div className="space-y-2">
											{level.books.length > 0 ? (
												level.books.map((book) => (
													<div key={book.id}>
														<div
															className="flex justify-between items-center cursor-pointer"
															onClick={() =>
																setExpandedBook(
																	expandedBook === book.id ? null : book.id
																)
															}
														>
															<h4 className="text-lg font-medium text-gray-700">
																{book.name ?? "No title available"}
															</h4>
															<button
																onClick={() => {
																	setShowConfirmation(true);
																	setItemToDelete({
																		id: book.id,
																		levelId: level.id,
																		type: "book",
																	});
																}}
																className="text-red-600 hover:text-red-800"
															>
																Delete Book
															</button>
														</div>
														{expandedBook === book.id && (
															<div className="space-y-2 ml-4">
																{book.pages?.map((page, index) => (
																	<div
																		key={page.id}
																		className={`flex justify-between items-center cursor-pointer ${
																			selectedPage === page.id
																				? "bg-gray-200"
																				: ""
																		}`}
																		onClick={() => setSelectedPage(page.id)}
																	>
																		<p className="text-sm text-gray-600">
																			Page {index + 1}: {page.name || "Unnamed"}
																		</p>
																		<button
																			onClick={() => {
																				setShowConfirmation(true);
																				setItemToDelete({
																					id: page.id,
																					bookId: book.id,
																					type: "page",
																				});
																			}}
																			className="text-red-600 hover:text-red-800"
																		>
																			Delete Page
																		</button>
																	</div>
																))}
															</div>
														)}
													</div>
												))
											) : (
												<p className="text-gray-600">
													No books assigned to this level
												</p>
											)}
										</div>
									)}
								</div>
							</div>
						))
					) : (
						<p className="text-gray-600">No levels available.</p>
					)}
				</div>
			)}

			{/* Confirmation Modal */}
			{showConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
					<div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
						<h3 className="text-lg font-semibold">
							Are you sure you want to delete this item?
						</h3>
						<div className="flex justify-end space-x-2 mt-4">
							<button
								onClick={() => setShowConfirmation(false)}
								className="px-4 py-2 bg-gray-300 text-black rounded-md"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								className="px-4 py-2 bg-red-600 text-white rounded-md"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
