import Image from "next/image";
import Feature1 from "../../public/assets/feature-1.svg";
import Feature2 from "../../public/assets/feature-2.svg";
import Feature3 from "../../public/assets/feature-3.svg";
import Check from "../../public/assets/check.svg";
import blueButton from "../../public/assets/blue-button.svg";
import greenButton from "../../public/assets/green-button.svg";
import pinkButton from "../../public/assets/pink-button.svg";

// Reusable CheckList Component
const CheckList = ({ items }) => (
	<ul className="flex flex-col gap-y-3 lg:text-[18px]">
		{items.map((item, index) => (
			<li key={index} className="flex items-center gap-x-2 text-[#36485C]">
				<Image src={Check} alt="Checkmark" />
				{item}
			</li>
		))}
	</ul>
);

// Reusable FeatureCard Component
const FeatureCard = ({
	image,
	titleColor,
	heading,
	description,
	checkListItems,
	buttonText,
	buttonImage,
	stats,
	imagePosition = "left",
}) => {
	return (
		<div
			className={`flex flex-col gap-x-6 ${
				imagePosition === "left" ? "sm:flex-row" : "sm:flex-row-reverse"
			}`}
		>
			<Image
				src={image}
				alt="Feature Image"
				className="hidden w-1/2 sm:block"
			/>
			<div
				className={`sm:w-1/2 lg:py-[56px] ${
					imagePosition === "left" ? "lg:pl-[56px]" : "lg:pr-[56px]"
				}`}
			>
				<h3 className={`font-medium ${titleColor} lg:text-[18px]`}>
					{heading.title}
				</h3>
				<h1 className="pt-[12px] text-2xl font-medium text-[#172026] lg:text-[42px] lg:leading-[58px]">
					{heading.subtitle}
				</h1>
				<Image
					src={image}
					alt="Feature Image"
					className="pt-[24px] sm:hidden"
				/>
				<p className="py-[24px] text-[#36485C] lg:text-[18px]">{description}</p>

				<CheckList items={checkListItems} />

				{stats && (
					<div className="flex w-full gap-x-[24px] pt-[24px]">
						{stats.map((stat, index) => (
							<div key={index} className="w-1/2 flex flex-col gap-y-3">
								<h3 className="text-[20px] font-medium text-[#172026]">
									{stat.value}
								</h3>
								<p className="text-[#36485C]">{stat.label}</p>
							</div>
						))}
					</div>
				)}

				<p
					className={`flex items-center gap-x-2 pt-[24px] font-medium ${titleColor} lg:text-[18px]`}
				>
					{buttonText}
					<span>
						<Image src={buttonImage} alt="Button Icon" />
					</span>
				</p>
			</div>
		</div>
	);
};

// Main Features Component
export function Features() {
	const featureData = [
		{
			image: Feature1,
			titleColor: "text-[#0085FF]",
			heading: {
				title: "Sales Monitoring",
				subtitle: "Simplify your sales monitoring",
			},
			description:
				"Stay on top of things and revamp your work process with our game-changing feature. Get a birds eye view with our customizable dashboard.",
			checkListItems: [
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
			],
			buttonText: "Learn More",
			buttonImage: blueButton,
			imagePosition: "right",
		},
		{
			image: Feature2,
			titleColor: "text-[#00A424]",
			heading: {
				title: "Customer Support",
				subtitle: "Get in touch with your customers",
			},
			description:
				"Stay on top of things and revamp your work process with our game-changing feature. Get a birds eye view with our customizable dashboard.",
			checkListItems: [
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
			],
			buttonText: "Learn More",
			buttonImage: greenButton,
			imagePosition: "left",
		},
		{
			image: Feature3,
			titleColor: "text-[#EB2891]",
			heading: {
				title: "Growth Monitoring",
				subtitle: "Monitor your site's new subscribers",
			},
			description:
				"Stay on top of things and revamp your work process with our game-changing feature. Get a birds eye view with our customizable dashboard.",
			checkListItems: [
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
				"Lorem ipsum dolor sit amet",
			],
			buttonText: "Learn More",
			buttonImage: pinkButton,
			stats: [
				{ value: "100+", label: "Lorem ipsum dolor sit" },
				{ value: "800+", label: "Conse adipiscing elit" },
			],
			imagePosition: "right",
		},
	];

	return (
		<div className="flex flex-col gap-y-[56px] py-[56px] lg:py-[120px] lg:gap-y-[80px] mx-[10%]">
			{featureData.map((feature, index) => (
				<FeatureCard key={index} {...feature} />
			))}
		</div>
	);
}
