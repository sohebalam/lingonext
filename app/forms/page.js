"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	arrayUnion,
} from "firebase/firestore";

export default function ManageLevelsBooks() {
	const [levels, setLevels] = useState([]);
	const [books, setBooks] = useState([]);
	const [selectedLevel, setSelectedLevel] = useState("");
	const [selectedBook, setSelectedBook] = useState("");
	const [loading, setLoading] = useState(false);

	// Fetch levels and books initially
	useEffect(() => {
		const fetchLevels = async () => {
			const levelsSnapshot = await getDocs(collection(db, "levels"));
			setLevels(
				levelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		const fetchBooks = async () => {
			const booksSnapshot = await getDocs(collection(db, "books"));
			setBooks(
				booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		fetchLevels();
		fetchBooks();
	}, []);

	// Add a new level and refresh the levels list
	const handleLevelSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const levelName = e.target.levelName.value;

		try {
			await addDoc(collection(db, "levels"), { name: levelName });
			const levelsSnapshot = await getDocs(collection(db, "levels"));
			setLevels(
				levelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
			alert("Level added successfully!");
		} catch (error) {
			console.error("Error adding level: ", error);
			alert("Failed to add level.");
		}

		setLoading(false);
	};

	// Add a new book and refresh the books list
	const handleBookSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const bookName = e.target.bookName.value;

		try {
			await addDoc(collection(db, "books"), { name: bookName, levelId: null });
			const booksSnapshot = await getDocs(collection(db, "books"));
			setBooks(
				booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
			alert("Book added successfully!");
		} catch (error) {
			console.error("Error adding book: ", error);
			alert("Failed to add book.");
		}

		setLoading(false);
	};

	// Assign a book to a level
	const handleAssignBookToLevel = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!selectedBook || !selectedLevel) {
				alert("Please select both a book and a level.");
				setLoading(false);
				return;
			}

			// Log book and level IDs to check
			console.log("Selected Book ID:", selectedBook);
			console.log("Selected Level ID:", selectedLevel);

			// Create a reference to the level document
			const levelRef = doc(db, "levels", selectedLevel);
			console.log("Level Ref:", levelRef.path);

			// Update the level document by adding the book's ID to the books array
			await updateDoc(levelRef, {
				books: arrayUnion(selectedBook), // Adds the book ID to the array
			});

			// Optionally, fetch updated levels to reflect changes
			const levelsSnapshot = await getDocs(collection(db, "levels"));
			setLevels(
				levelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);

			alert("Book successfully assigned to level!");
		} catch (error) {
			console.error("Error assigning book to level:", error);
			alert("Failed to assign book to level.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md space-y-8">
			{/* Level Form */}
			<div>
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Add Level</h2>
				<form onSubmit={handleLevelSubmit} className="space-y-4">
					<input
						type="text"
						name="levelName"
						placeholder="Enter level name"
						required
						className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					/>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
					>
						{loading ? "Loading..." : "Add Level"}
					</button>
				</form>
			</div>

			{/* Book Form */}
			<div>
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Add Book</h2>
				<form onSubmit={handleBookSubmit} className="space-y-4">
					<input
						type="text"
						name="bookName"
						placeholder="Enter book name"
						required
						className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					/>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
					>
						{loading ? "Loading..." : "Add Book"}
					</button>
				</form>
			</div>

			{/* Assign Book to Level Form */}
			<div>
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Assign Book to Level
				</h2>
				<form onSubmit={handleAssignBookToLevel} className="space-y-4">
					<div>
						<label className="block font-medium text-gray-700">
							Select Book
						</label>
						<select
							value={selectedBook}
							onChange={(e) => setSelectedBook(e.target.value)}
							required
							className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						>
							<option value="" disabled>
								Select a book
							</option>
							{books.map((book) => (
								<option key={book.id} value={book.id}>
									{book.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block font-medium text-gray-700">
							Select Level
						</label>
						<select
							value={selectedLevel}
							onChange={(e) => setSelectedLevel(e.target.value)}
							required
							className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						>
							<option value="" disabled>
								Select a level
							</option>
							{levels.map((level) => (
								<option key={level.id} value={level.id}>
									{level.name}
								</option>
							))}
						</select>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
					>
						{loading ? "Loading..." : "Assign Book to Level"}
					</button>
				</form>
			</div>
		</div>
	);
}
