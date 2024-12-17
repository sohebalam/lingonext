"use client";
import { useState, useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import {
	GoogleAuthProvider,
	signInWithRedirect,
	onAuthStateChanged,
} from "firebase/auth";

const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
	const router = useRouter();

	// Google sign-in function
	const handleGoogleSignIn = async () => {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithRedirect(auth, provider);
		} catch (error) {
			console.error("Google Sign-In Error:", error);
		}
	};

	// Handle email/password sign-in
	const handleSignIn = async () => {
		try {
			const res = await signInWithEmailAndPassword(email, password);
			console.log("Email Sign-In Response:", res);
			sessionStorage.setItem("user", true);
			setEmail("");
			setPassword("");
			router.push("/home");
		} catch (e) {
			console.error("Email Sign-In Error:", e);
		}
	};

	// Monitor authentication state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log("User is signed in:", user);
				console.log("User details:", {
					email: user.email,
					displayName: user.displayName,
					uid: user.uid,
				});
			} else {
				console.log("User is not signed in.");
			}
		});

		return () => unsubscribe(); // Clean up the listener on component unmount
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
				<h1 className="text-white text-2xl mb-5">Sign In</h1>

				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
				/>

				<button
					onClick={handleSignIn}
					className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
				>
					Sign In
				</button>

				<div className="text-center my-4">
					<button
						onClick={handleGoogleSignIn}
						className="w-full p-3 bg-blue-500 rounded text-white hover:bg-blue-400"
					>
						Sign In with Google
					</button>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
