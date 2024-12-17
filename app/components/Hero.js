import Image from "next/image";
import BlurArrow from "../../public/assets/blue-button.svg";
import Gradient from "../../public/assets/Gradient.svg";
import HeroImage from "../../public/assets/Image.png";
import Google from "../../public/assets/Google.svg";
import Slack from "../../public/assets/Slack.svg";
import Truspilot from "../../public/assets/Trustpilot.svg";
import Cnn from "../../public/assets/CNN.svg";
import Cluth from "../../public/assets/Clutch.svg";

export function Hero() {
	return (
		<div className="pt-4 lg:pt-10">
			<div className="px-[20px] lg:px-[280px]">
				<h1 className="text-center text-[32px] leading-[40px] font-medium text-[#172026] lg:text-[64px] lg:leading-[72px]">
					Start learning languages through stories
				</h1>
				<p className="text-center pt-6 text-[#36485C] lg:text-[18px] lg:leading-7">
					Explore language learning through captivating picture books. Engage,
					inspire, and make progress effortlessly with Lingo Stories!
				</p>

				<div className="flex w-full pt-8 justify-center gap-x-6 ">
					{/* Change button Color */}
					<button className="bg-[#4328EB] w-1/2 py-4 px-8 text-white rounded-[4px] lg:w-fit">
						Try for free
					</button>
					<button className="w-1/2 text-[#4328EB] flex items-center justify-center gap-x-2 lg:w-fit">
						View Pricing
						<span>
							<Image src={BlurArrow} alt="Learn more" />
						</span>
					</button>
				</div>
			</div>

			<div className="relative flex h-full w-full justify-center">
				<Image
					src={Gradient}
					alt="Gradient"
					className="min-h-[500px] w-full object-cover lg:h-auto"
				/>

				<div className="absolute bottom-5 flex w-full flex-col items-center">
					<Image
						src={HeroImage}
						alt="hero image"
						className="-ml-4 h-[310px] sm:-mb-20 sm:h-[350px] sm:w-[650px] lg:h-auto xl:w-[70%] lg:-translate-y-56 sm:-translate-y-36"
					/>
				</div>
			</div>
		</div>
	);
}
