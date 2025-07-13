import React from "react";
import { FooterLink2 } from "./FooterLink";
import { Link } from "react-router-dom";
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";
import Logo from "../assets/Logo-w.png"; // Import your logo
const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];
const Resources = [
    "Code challenges",
    "Docs",
    "Projects",
    "Videos",
    "Workspaces",
];

const Footer = () => {
    return (
        <div className="bg-[#000] w-full  my-4 md:px-8 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-10 items-center justify-between w-11/12 max-w-maxContent text-richblack-400 leading-6 mx-auto relative py-14">
                <div className="border-b w-full flex flex-col lg:flex-row pb-10 border-richblack-700 gap-10">
                    {/* Logo Section */}
                    <div className="flex flex-col items-start pr-10">
                        <img src={Logo} alt="Logo" className="w-48 h-auto " />
                    </div>
                    {/* Footer Content */}
                    <div className="lg:w-[50%] flex flex-wrap flex-col sm:flex-row justify-between lg:border-r lg:border-richblack-700 pl-3 lg:pr-5 gap-10">
                        <div className="w-full sm:w-[30%] flex flex-col gap-5 mb-10 ml-6 lg:pl-0">
                            <h1 className="text-richblack-50 font-semibold text-white text-[18px]">
                                Company
                            </h1>
                            <div className="flex flex-col gap-4 text-[#6E727F]">
                                {["About", "Careers", "Affiliates"].map((ele, i) => {
                                    return (
                                        <div
                                            key={i}
                                            className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200"
                                        >
                                            <Link to={`/${ele.toLowerCase()}`}>{ele}</Link>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-5 text-lg text-white ">
                                <FaFacebook />
                                <FaGoogle />
                                <FaTwitter />
                                <FaYoutube />
                            </div>
                        </div>

                        <div className="w-full sm:w-[30%] mb-10 lg:pl-0">
                            <h1 className="text-richblack-50 font-semibold text-white text-[18px]">
                                Resources
                            </h1>
                            <div className="flex flex-col gap-4 mt-4 text-[#6E727F]">
                                {Resources.map((ele, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200"
                                        >
                                            <Link
                                                to={`/${ele.replace(/ /g, "-").toLowerCase()}`}
                                            >
                                                {ele}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-[50%] flex flex-wrap flex-col sm:flex-row justify-between pl-3 lg:pl-5 gap-10">
                        {FooterLink2.map((ele, i) => {
                            return (
                                <div key={i} className="w-full sm:w-[30%] mb-10 lg:pl-0">
                                    <h1 className="text-richblack-50 text-white font-semibold text-[18px]">
                                        {ele.title}
                                    </h1>
                                    <div className="flex flex-col text-[#6E727F] gap-4 mt-4">
                                        {ele.links.map((link, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200"
                                                >
                                                    <Link to={link.link}>{link.title}</Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-11/12 max-w-maxContent text-richblack-400 mx-auto pb-14 text-sm">
                <div className="flex flex-col sm:flex-row justify-between w-full gap-5">
                    <div className="flex flex-wrap justify-center sm:justify-start text-[#6E727F] gap-5">
                        {BottomFooter.map((ele, i) => {
                            return (
                                <div
                                    key={i}
                                    className={`${BottomFooter.length - 1 === i
                                        ? ""
                                        : "border-r border-richblack-700 cursor-pointer hover:text-richblack-50 transition-all duration-200"
                                        } px-5 `}
                                >
                                    <Link to={`/${ele.replace(/ /g, "-").toLowerCase()}`}>{ele}</Link>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-4 text-[#6E727F] sm:mt-0">
                        Made with ❤ CodeHelp © 2023 Studynotion
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;