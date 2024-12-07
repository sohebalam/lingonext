"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/firebase/config";
import { collection, getDoc, updateDoc, doc } from "firebase/firestore";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditPage() {
	const { id } = useParams(); // Get dynamic route param
	const [pageData, setPageData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState({
		text: "",
		textLanguage: "",
		translations: [{ language: "", text: "" }],
		picture: null,
		pictureUrl: "",
		isFrontCover: false,
	});

	useEffect(() => {
		const fetchPageData = async () => {
			try {
				if (id) {
					const pageDoc = await getDoc(doc(db, "pages", id));
					if (pageDoc.exists()) {
						const data = pageDoc.data();
						setPageData(data);
						setFormData((prev) => ({
							...prev,
							...data,
							pictureUrl: data.picture || "",
						}));
					} else {
						alert("Page not found.");
					}
				}
			} catch (error) {
				console.error("Error fetching page:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPageData();
	}, [id]);

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle file input
	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			try {
				const storage = getStorage();
				const storageRef = ref(storage, `pictures/${file.name}`);
				await uploadBytes(storageRef, file);
				const pictureUrl = await getDownloadURL(storageRef);

				setFormData((prev) => ({
					...prev,
					picture: file,
					pictureUrl,
				}));
			} catch (error) {
				console.error("Error uploading picture:", error);
			}
		}
	};

	// Handle translation changes
	const handleTranslationChange = (index, field, value) => {
		const updatedTranslations = [...formData.translations];
		updatedTranslations[index][field] = value;
		setFormData((prev) => ({
			...prev,
			translations: updatedTranslations,
		}));
	};

	// Add new translation field
	const addTranslation = () => {
		setFormData((prev) => ({
			...prev,
			translations: [...prev.translations, { language: "", text: "" }],
		}));
	};

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const updatedData = {
				text: formData.text,
				textLanguage: formData.textLanguage,
				translations: formData.translations,
				picture: formData.pictureUrl,
				isFrontCover: formData.isFrontCover,
			};

			await updateDoc(doc(db, "pages", id), updatedData);
			alert("Page updated successfully!");
		} catch (error) {
			console.error("Error updating page:", error.message);
			alert("Failed to update page.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-md shadow-md">
			<h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Page</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Picture Input */}
				<div className="flex items-center gap-1">
					<div>
						<label className="block font-medium text-gray-700">
							Update Picture
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="block mt-1"
						/>
					</div>
					{/* Display Current Picture */}
					{formData.pictureUrl && (
						<img
							src={formData.pictureUrl}
							alt="Current Page"
							className="w-16 h-16 rounded-full object-cover border"
						/>
					)}
				</div>

				{/* Text Input */}
				<div>
					<label className="block font-medium text-gray-700">Text</label>
					<textarea
						name="text"
						value={formData.text}
						onChange={handleChange}
						rows="4"
						className="w-full mt-1 p-2 border border-gray-300 rounded-md"
					></textarea>
				</div>
				{/* Language */}
				<div>
					<label className="block font-medium text-gray-700">
						Language of Text
					</label>
					<input
						type="text"
						name="textLanguage"
						value={formData.textLanguage}
						onChange={handleChange}
						className="w-full mt-1 p-2 border border-gray-300 rounded-md"
					/>
				</div>
				{/* Translations */}
				<h3 className="text-lg font-medium">Translations</h3>
				{formData.translations.map((translation, index) => (
					<div key={index} className="space-y-2">
						<input
							type="text"
							placeholder="Language"
							value={translation.language}
							onChange={(e) =>
								handleTranslationChange(index, "language", e.target.value)
							}
							className="w-full p-2 border border-gray-300 rounded-md"
						/>
						<textarea
							placeholder="Translation Text"
							value={translation.text}
							onChange={(e) =>
								handleTranslationChange(index, "text", e.target.value)
							}
							rows="2"
							className="w-full p-2 border border-gray-300 rounded-md"
						></textarea>
					</div>
				))}
				<button
					type="button"
					onClick={addTranslation}
					className="text-blue-600 hover:underline"
				>
					+ Add Translation
				</button>
				{/* Submit */}
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					{loading ? "Updating..." : "Update Page"}
				</button>
			</form>
		</div>
	);
}
