"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditLevel() {
	const { id } = useParams(); // Extract `ids` dynamically using the `useParams` hook
	const [level, setLevel] = useState(null);
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState({
		name: "",
	});

	// Fetch the level data
	useEffect(() => {
		if (!id) return;

		const fetchLevel = async () => {
			try {
				const levelDoc = await getDoc(doc(db, "levels", id));
				if (levelDoc.exists()) {
					const levelData = levelDoc.data();
					setLevel(levelData);
					setFormData({
						name: levelData.name || "",
					});
				} else {
					alert("Level not found.");
				}
			} catch (error) {
				console.error("Error fetching level:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLevel();
	}, [id]);

	// Handle form changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			await updateDoc(doc(db, "levels", id), formData);
			alert("Level updated successfully!");
		} catch (error) {
			console.error("Error updating level:", error);
			alert("Failed to update level.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-md shadow-md">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Level</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-gray-700 font-medium">Level Name</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
				>
					{loading ? "Updating..." : "Update Level"}
				</button>
			</form>
		</div>
	);
}
