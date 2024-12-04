"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function ManagePages() {
	const [books, setBooks] = useState([]);
	const [translations, setTranslations] = useState([
		{ language: "", text: "" },
	]);
	const [picture, setPicture] = useState(null);
	const [loading, setLoading] = useState(false);
	const [levels, setLevels] = useState([]);

	useEffect(() => {
		const fetchBooks = async () => {
			const booksSnapshot = await getDocs(collection(db, "books"));
			setBooks(
				booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		fetchBooks();
	}, []);

	useEffect(() => {
		const fetchLevels = async () => {
			const levelsSnapshot = await getDocs(collection(db, "levels"));
			setLevels(
				levelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		fetchLevels();
	}, []);

	const handlePageSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const text = e.target.text.value;
		const bookId = e.target.bookId.value;

		try {
			await addDoc(collection(db, "pages"), { text, bookId });
			alert("Page added successfully!");
		} catch (error) {
			console.error("Error adding page: ", error);
			alert("Failed to add page.");
		}

		setLoading(false);
	};

	const addTranslation = () => {
		setTranslations([...translations, { language: "", text: "" }]);
	};

	const handleInputChange = (index, field, value) => {
		const updatedTranslations = [...translations];
		updatedTranslations[index][field] = value;
		setTranslations(updatedTranslations);
	};

	// Define handleFileChange to manage file input
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPicture(file);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md space-y-8">
			<h2 className="text-2xl font-bold text-gray-800 mb-4">Add Page</h2>
			<form onSubmit={handlePageSubmit} className="space-y-4">
				{/* Collection Level */}
				<div>
					<label className="block font-medium text-gray-700">
						Select Collection Level
					</label>
					<select
						name="collectionLevel"
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					>
						<option value="" disabled selected>
							Select a level
						</option>
						{levels.map((level) => (
							<option key={level.id} value={level.id}>
								{level.name}
							</option>
						))}
					</select>
				</div>

				{/* Select Book */}
				<div>
					<label className="block font-medium text-gray-700">Select Book</label>
					<select
						name="bookId"
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					>
						<option value="" disabled selected>
							Select a book
						</option>
						{books.map((book) => (
							<option key={book.id} value={book.id}>
								{book.name}
							</option>
						))}
					</select>
				</div>

				{/* File Input */}
				<div>
					<label className="block font-medium text-gray-700">
						Upload Picture
					</label>
					<input
						type="file"
						onChange={handleFileChange}
						accept="image/*"
						className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
					/>
				</div>

				{/* Text Input */}
				<div>
					<label className="block font-medium text-gray-700">Enter Text</label>
					<textarea
						name="text"
						rows="4"
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					></textarea>
				</div>

				{/* Language of Text */}
				<div>
					<label className="block font-medium text-gray-700">
						Language of Text
					</label>
					<input
						type="text"
						name="textLanguage"
						placeholder="e.g., English"
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					/>
				</div>

				{/* Translations */}
				<h3 className="text-lg font-medium text-gray-800">Translations</h3>
				{translations.map((translation, index) => (
					<div key={index} className="space-y-2">
						<label className="block font-medium text-gray-700">
							Translation {index + 1}
						</label>
						<input
							type="text"
							placeholder="Language"
							value={translation.language}
							onChange={(e) =>
								handleInputChange(index, "language", e.target.value)
							}
							required
							className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						/>
						<textarea
							placeholder="Translated Text"
							rows="2"
							value={translation.text}
							onChange={(e) => handleInputChange(index, "text", e.target.value)}
							required
							className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						/>
					</div>
				))}

				{/* Add More Translations */}
				<button
					type="button"
					onClick={addTranslation}
					className="text-blue-600 hover:underline"
				>
					+ Add More Translations
				</button>

				{/* Submit */}
				<div>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
					>
						{loading ? "Loading..." : "Submit"}
					</button>
				</div>
			</form>
		</div>
	);
}
