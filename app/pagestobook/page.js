"use client";

import { useState, useEffect } from "react";
import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	arrayUnion,
} from "firebase/firestore";
import { db } from "@/app/firebase/config"; // Your Firebase configuration

export default function AddPagesToBooks() {
	const [books, setBooks] = useState([]);
	const [selectedBook, setSelectedBook] = useState("");
	const [text, setText] = useState("");
	const [translations, setTranslations] = useState([
		{ language: "", text: "" },
	]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const booksSnapshot = await getDocs(collection(db, "books"));
				setBooks(
					booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
				);
			} catch (error) {
				console.error("Error fetching books:", error);
			}
		};

		fetchBooks();
	}, []);

	const handlePageSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!selectedBook) {
				alert("Please select a book.");
				setLoading(false);
				return;
			}

			// Create a new page document
			const pageData = {
				text,
				bookId: selectedBook,
				translations,
			};
			await addDoc(collection(db, "pages"), pageData);

			// Optionally update the book document to include the new page
			const bookRef = doc(db, "books", selectedBook);
			await updateDoc(bookRef, {
				pages: arrayUnion(pageData), // Adds the page details to the book's pages array
			});

			alert("Page successfully added!");
			setText("");
			setTranslations([{ language: "", text: "" }]);
		} catch (error) {
			console.error("Error adding page:", error);
			alert("Failed to add page.");
		} finally {
			setLoading(false);
		}
	};

	const addTranslationField = () => {
		setTranslations([...translations, { language: "", text: "" }]);
	};

	const updateTranslation = (index, field, value) => {
		const updatedTranslations = [...translations];
		updatedTranslations[index][field] = value;
		setTranslations(updatedTranslations);
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md">
			<h2 className="text-2xl font-bold text-gray-800 mb-4">
				Add Page to Book
			</h2>
			<form onSubmit={handlePageSubmit} className="space-y-4">
				{/* Select Book */}
				<div>
					<label className="block font-medium text-gray-700">Select Book</label>
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

				{/* Enter Page Text */}
				<div>
					<label className="block font-medium text-gray-700">Page Text</label>
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						rows="4"
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					></textarea>
				</div>

				{/* Translations */}
				<div>
					<h3 className="text-lg font-medium text-gray-800">Translations</h3>
					{translations.map((translation, index) => (
						<div key={index} className="space-y-2">
							<input
								type="text"
								placeholder="Language"
								value={translation.language}
								onChange={(e) =>
									updateTranslation(index, "language", e.target.value)
								}
								required
								className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
							/>
							<textarea
								placeholder="Translated Text"
								value={translation.text}
								onChange={(e) =>
									updateTranslation(index, "text", e.target.value)
								}
								rows="2"
								required
								className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
							></textarea>
						</div>
					))}
					<button
						type="button"
						onClick={addTranslationField}
						className="text-blue-600 hover:underline"
					>
						+ Add More Translations
					</button>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
				>
					{loading ? "Loading..." : "Add Page"}
				</button>
			</form>
		</div>
	);
}
