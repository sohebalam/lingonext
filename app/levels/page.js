"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Import Firebase config
import { collection, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore methods

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

						return { ...level, books };
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

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md space-y-8">
			<h2 className="text-2xl font-bold text-gray-800 mb-4">
				Levels with Books
			</h2>
			{loading ? (
				<p>Loading...</p>
			) : (
				<div className="space-y-6">
					{levels.map((level) => (
						<div key={level.id} className="space-y-4">
							<h3 className="text-xl font-semibold text-gray-800">
								{level.name}
							</h3>
							<ul className="space-y-2">
								{level.books.length > 0 ? (
									level.books.map((book) => (
										<li
											key={book.id}
											className="p-2 bg-white shadow rounded-md"
										>
											<p className="font-medium text-gray-700">{book.name}</p>
										</li>
									))
								) : (
									<li className="text-gray-600">
										No books assigned to this level
									</li>
								)}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
