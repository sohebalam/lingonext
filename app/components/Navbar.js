import Image from "next/image";
import Logo from "../../public/assets/Logo.png";
import User from "../../public/assets/User.svg";
import Menu from "../../public/assets/Menu.svg";
import { useAuth } from "@/app/service/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link from Next.js
import React, { useEffect, useState } from "react";

const navLinks = [
	{ name: "Home", href: "/" },
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Contact Us", href: "/contact" },
	{ name: "Bookform", href: "/forms/bookform" },
	{ name: "Forms", href: "/forms" },
];

export function Navbar() {
	const { user, logOut } = useAuth();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Set isRouterReady to true once the router is initialized
		setMounted(true);
	}, []);

	const handleSignInClick = () => {
		console.log("Navigating to login");
		router.push("/login");
	};

	const handleLogOutClick = () => {
		console.log("Logging out");
		logOut();
	};

	return (
		<nav className="flex w-full items-center justify-between px-[20px] py-[16px] lg:container lg:mx-auto lg:px-20">
			<div className="flex items-center">
				<Image src={Logo} alt="Logo" width={35} height={35} />

				<div className="hidden lg:flex pl-[74px] gap-x-[56px]">
					{navLinks.map((item, index) => (
						<Link key={index} href={item.href}>
							<p className="text-[#36485C] font-medium">{item.name}</p>
						</Link>
					))}
				</div>
			</div>

			<div className="flex gap-x-5">
				<p className="hidden lg:block font-medium text-[#36485C] pr-[56px]">
					Open an Account
				</p>

				{user ? (
					<div className="flex items-center gap-x-2">
						<Image src={User} alt="User Profile" />
						<span className="hidden font-medium text-[#36485C] lg:block">
							{user.name}
						</span>
						<button
							className="font-medium text-[#36485C] lg:block"
							onClick={handleLogOutClick}
						>
							Logout
						</button>
					</div>
				) : (
					<div
						className="flex items-center gap-x-2 cursor-pointer"
						onClick={handleSignInClick}
					>
						<Image src={User} alt="User Profile" />
						<span className="hidden font-medium text-[#36485C] lg:block">
							Sign in
						</span>
					</div>
				)}

				<Image src={Menu} alt="Menu Button" className="lg:hidden" />
			</div>
		</nav>
	);
}
