"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import {
	collection,
	addDoc,
	getDocs,
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ManagePages() {
	const [books, setBooks] = useState([]);
	const [levels, setLevels] = useState([]);
	const [languages, setLanguages] = useState([]);
	const [translations, setTranslations] = useState([
		{ language: "", text: "" },
	]);
	const [picture, setPicture] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isFrontCover, setIsFrontCover] = useState(false); // State for front cover checkbox

	// Fetch books, levels, and languages
	useEffect(() => {
		const fetchBooks = async () => {
			const booksSnapshot = await getDocs(collection(db, "books"));
			setBooks(
				booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		const fetchLevels = async () => {
			const levelsSnapshot = await getDocs(collection(db, "levels"));
			setLevels(
				levelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};

		const fetchLanguages = async () => {
			const languagesSnapshot = await getDocs(collection(db, "languages"));
			setLanguages(
				languagesSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}))
			);
		};

		fetchBooks();
		fetchLevels();
		fetchLanguages();
	}, []);

	const handlePageSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(""); // Clear previous errors

		const text = e.target.text.value;
		const bookId = e.target.bookId.value;
		const textLanguage = e.target.textLanguage.value; // Selected language ID

		// Validation: Ensure a picture is uploaded
		if (!picture) {
			setLoading(false);
			setError("Please upload a picture.");
			return;
		}

		// If it's not the front cover, ensure there is at least one translation and original text
		if (!isFrontCover) {
			// Validation: Ensure there is at least one translation
			if (!translations.length || !translations[0].text) {
				setLoading(false);
				setError("Please provide at least one translation.");
				return;
			}

			// Validation: Ensure original text is provided
			if (!text) {
				setLoading(false);
				setError("Please provide the original text.");
				return;
			}
		}

		try {
			let pictureUrl = null;
			if (picture) {
				const storage = getStorage();
				const storageRef = ref(storage, `pictures/${picture.name}`);
				await uploadBytes(storageRef, picture);
				pictureUrl = await getDownloadURL(storageRef);
			}

			const data = {
				text,
				bookId,
				textLanguage, // Save the selected language ID
				translations,
				picture: pictureUrl,
				isFrontCover, // Save whether it's the front cover
			};

			// Add page to the 'pages' collection
			const pageDocRef = await addDoc(collection(db, "pages"), data);
			const pageId = pageDocRef.id;

			// Update book's pages array
			const bookDocRef = doc(db, "books", bookId);
			const bookSnap = await getDoc(bookDocRef);

			if (bookSnap.exists()) {
				const currentPages = bookSnap.data().pages || [];
				if (isFrontCover) {
					currentPages.unshift(pageId); // If it's the front cover, add it to the start of the array
				} else {
					currentPages.push(pageId);
				}

				await updateDoc(bookDocRef, { pages: currentPages });
				alert("Page added successfully and associated with the book!");
			} else {
				alert("Book not found.");
			}
		} catch (error) {
			console.error("Error adding page:", error.message);
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

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPicture(file);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md space-y-8">
			<h2 className="text-2xl font-bold text-gray-800 mb-4">Add Page</h2>

			{error && (
				<div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
					{error}
				</div>
			)}

			<form onSubmit={handlePageSubmit} className="space-y-4">
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

				{/* Front Cover Checkbox */}
				<div>
					<label className="block font-medium text-gray-700">
						Is this the front cover?
					</label>
					<input
						type="checkbox"
						checked={isFrontCover}
						onChange={(e) => setIsFrontCover(e.target.checked)}
						className="mt-1"
					/>
				</div>

				{/* Text Input */}
				{!isFrontCover && (
					<div>
						<label className="block font-medium text-gray-700">
							Enter Text
						</label>
						<textarea
							name="text"
							rows="4"
							required
							className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						></textarea>
					</div>
				)}

				{/* Language of Text */}
				{!isFrontCover && (
					<div>
						<label className="block font-medium text-gray-700">
							Language of Text
						</label>
						<select
							name="textLanguage"
							required
							className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
						>
							<option value="" disabled selected>
								Select a language
							</option>
							{languages.map((language) => (
								<option key={language.id} value={language.id}>
									{language.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Translations */}
				{!isFrontCover && (
					<>
						<h3 className="text-lg font-medium text-gray-800">Translations</h3>
						{translations.map((translation, index) => (
							<div key={index} className="space-y-2">
								<label className="block font-medium text-gray-700">
									Translation {index + 1}
								</label>

								<select
									value={translation.language}
									onChange={(e) =>
										handleInputChange(index, "language", e.target.value)
									}
									required
									className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
								>
									<option value="" disabled>
										Select a language
									</option>
									{languages.map((language) => (
										<option key={language.id} value={language.id}>
											{language.name}
										</option>
									))}
								</select>

								<textarea
									placeholder="Translated Text"
									rows="2"
									value={translation.text}
									onChange={(e) =>
										handleInputChange(index, "text", e.target.value)
									}
									required
									className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
								/>
							</div>
						))}
						<button
							type="button"
							onClick={addTranslation}
							className="text-blue-600 hover:underline"
						>
							Add Translation
						</button>
					</>
				)}

				{/* Submit Button */}
				<div className="flex justify-center">
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						{loading ? "Adding..." : "Add Page"}
					</button>
				</div>
			</form>
		</div>
	);
}
