"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditBook() {
	const { id } = useParams(); // Using the `useParams` hook
	const [book, setBook] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [loading, setLoading] = useState(true);

	// Fetch book data
	useEffect(() => {
		const fetchBook = async () => {
			try {
				const bookDoc = await getDoc(doc(db, "books", id));
				if (bookDoc.exists()) {
					const bookData = bookDoc.data();
					setBook(bookData);
					setFormData({
						name: bookData.name || "",
						description: bookData.description || "",
					});
				} else {
					alert("Book not found.");
				}
			} catch (error) {
				console.error("Error fetching book:", error);
				alert("Failed to fetch book.");
			} finally {
				setLoading(false);
			}
		};

		if (id) fetchBook();
	}, [id]);

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Update book data
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const bookRef = doc(db, "books", id);
			await updateDoc(bookRef, formData);
			alert("Book updated successfully!");
		} catch (error) {
			console.error("Error updating book:", error);
			alert("Failed to update book.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-md shadow-md">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Book</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-gray-700 font-medium">Book Name</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					/>
				</div>
				<div>
					<label className="block text-gray-700 font-medium">
						Book Description
					</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows="4"
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					></textarea>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
				>
					{loading ? "Updating..." : "Update Book"}
				</button>
			</form>
		</div>
	);
}
