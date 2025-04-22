import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/createcampaign"); // Redirects to the login page
  };
   
  return <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{{project.meta.ogDescription}}" />
  <meta name="theme-color" content="#ffffff" />
  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
  <meta name="robots" content="{{project.meta.robotsMeta}}" />
  <title>
    {"{"}
    {"{"}project.seoTitle{"}"}
    {"}"}
  </title>
  {/* SEO Description */}
  <meta name="description" content="{{project.seoDescription}}" />
  {/* Performance optimization: Preload critical resources */}
  <link rel="preload" href="https://cdn.tailwindcss.com" as="script" />
  <link
    rel="preload"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
    as="style"
  />
  {/* Preconnect */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  {/* Font stylesheet */}
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  {/* Core CSS */}
  {/* Utilities and Components */}
  {/* Optimized Font Loading */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  {/* Icons */}
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  />
  {/* Dynamic Meta Tags */}
  <meta name="description" content="{{project.meta.ogDescription}}" />
  <meta name="keywords" content="{{project.meta.keywords}}" />
  <meta name="robots" content="{{project.meta.robotsMeta}}" />
  <meta
    name="google-site-verification"
    content="{{project.meta.googleVerification}}"
  />
  <meta
    name="baidu-verification"
    content="{{project.meta.baiduVerification}}"
  />
  <meta
    name="yandex-verification"
    content="{{project.meta.yandexVerification}}"
  />
  <meta name="bing-verification" content="{{project.meta.bingVerification}}" />
  <meta property="og:title" content="{{project.meta.ogTitle}}" />
  <meta property="og:description" content="{{project.meta.ogDescription}}" />
  <meta property="og:image" content="{{project.meta.ogImage}}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="{{project.name}}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{project.meta.ogTitle}}" />
  <meta name="twitter:description" content="{{project.meta.ogDescription}}" />
  <meta name="twitter:image" content="{{project.meta.ogImage}}" />
  <link rel="icon" type="image/x-icon" href="{{settings.favicon}}" />
  {/* Skip to main content link for accessibility */}
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black"
  >
    Skip to main content
  </a>
  {/* Header */}
  <header className="relative z-50 bg-white dark:bg-gray-900">
    {/* Header content goes here */}
  </header>
  {/* Main content area */}
  <main id="main-content" className="flex-1 relative ">
    {/* Content will be injected here */}
  </main>
  {/* {bodyScripts} */}
  <element
    id="8200bcc5-b6b0-492d-a05a-493c77a29257"
    data-section-id="8200bcc5-b6b0-492d-a05a-493c77a29257"
  >
    <div id="root">
    <nav id="navbar" className="fixed top-0 left-0 w-full z-50 bg-neutral-900 text-white px-6 py-4 shadow-lg">
  {/* Navbar Container */}
  <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
    
    {/* Logo */}
    <a href="/" className="flex items-center space-x-2">
      <img src="https://dealsbe.com/images/logo.svg" alt="Logo" className="h-8 w-8" />
      <span className="font-bold text-xl text-white">Impacta</span> {/* Now white */}
    </a>

    {/* Desktop Menu */}
    <div className="hidden md:flex flex-1 justify-center space-x-8">
    <a href="/" className="text-white hover:text-gray-300 transition-colors duration-200 !text-white">
  Home
</a>
<a href="#featuredCampaigns" onClick={() => scrollToSection('featuredCampaigns')} className="text-white hover:text-gray-300 transition-colors duration-200 !text-white">
  Discover
</a>
<a href="#howItWorks" onClick={() => scrollToSection('howItWorks')} className="text-white hover:text-gray-300 transition-colors duration-200 !text-white">
  How It Works
</a>
<a href="#successStories" onClick={() => scrollToSection('successStories')} className="text-white hover:text-gray-300 transition-colors duration-200 !text-white">
  Success Stories
</a>
    </div>

    {/* Call-to-Action Button */}
    <button onClick={handleNavigation} className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-md text-white">
      Start Campaign
    </button>

    {/* Mobile Menu Button */}
    <div className="md:hidden">
      <button id="mobile-menu-button" className="text-white hover:text-gray-300">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  <div id="mobile-menu" className="hidden md:hidden bg-neutral-800">
    <div className="px-2 pt-2 pb-3 space-y-1">
      <a href="/" className="block px-3 py-2 rounded-md hover:bg-neutral-700 text-white">Home</a>
      <a href="/discover" className="block px-3 py-2 rounded-md hover:bg-neutral-700 text-white">Discover</a>
      <a href="/how-it-works" className="block px-3 py-2 rounded-md hover:bg-neutral-700 text-white">How It Works</a>
      <a href="/start-campaign" className="block px-3 py-2 rounded-md hover:bg-neutral-700 text-white">Start a Campaign</a>
      <a href="/success-stories" className="block px-3 py-2 rounded-md hover:bg-neutral-700 text-white">Success Stories</a>
      <Link to="/register">
  <button className="w-full text-center bg-accent hover:bg-accent/90 px-4 py-2 rounded-md mt-4 text-white">
    Start Campaign
  </button>
</Link>
    </div>
  </div>
</nav>

    </div>
  </element>

  <element
    id="3c8b611a-73c5-4bf1-825a-34c0fddb8624"
    data-section-id="3c8b611a-73c5-4bf1-825a-34c0fddb8624"
  >
    <div id="root">
      <section id="hero" className="bg-neutral-900 text-white min-h-[70vh] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate__animated animate__fadeInLeft">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Make a Difference <br />
                <span className="text-accent">One Project at a Time</span>
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Join our community of changemakers and help bring innovative
                ideas to life. Start or support a project today.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-accent hover:bg-accent/90 px-8 py-4 rounded-lg text-lg font-semibold animate__animated animate__pulse animate__infinite">
                  Start Your Project
                </button>
                <a href="#featuredCampaigns" onClick={() => scrollToSection('featuredCampaigns')} className="text-white hover:text-gray-300 transition-colors duration-200 !text-white">
                <button className="border-2 border-white hover:bg-white hover:text-neutral-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300">
                  Browse Projects
                </button>
                </a>
              </div>
              
              {/* Profile Images + Text Alignment */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-4">
                  <img
                    src="https://dealsbe.com/media/50/conversions/01JB9Z454NPE7NRVAQQ0QKYM15-thumb.jpg"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900"
                    alt="User"
                  />
                  <img
                    src="https://dealsbe.com/media/51/conversions/01JB9Z5JRAT9BKY3KZSM8225YQ-thumb.jpg"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900"
                    alt="User"
                  />
                  <img
                    src="https://dealsbe.com/media/52/conversions/01JB9Z6JAJZE9V2WN4AKKET7TE-thumb.jpg"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900"
                    alt="User"
                  />
                </div>
                
                {/* Bring text closer to images */}
                <p className="text-sm text-gray-300 ml-2">
                  Join 10,000+ people who already trust Impacta
                </p>
              </div>

            </div>

            {/* Right Section */}
            <div className="relative animate__animated animate__fadeInRight">
              <img
                src="https://dealsbe.com/images/banner.svg"
                alt="Hero"
                className="w-full max-w-lg mx-auto"
              />
              <div className="absolute -top-4 -right-4 bg-accent px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">100% Secure Platform</p>
              </div>
              
              {/* ✅ Fixed: 24/7 Support Available Box */}
              <div class="absolute -bottom-4 -left-4 bg-white text-neutral-900 px-4 py-2 rounded-lg shadow-lg available">
                <p class="text-sm font-semibold">24/7 Support Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Gradient */}
    {/*<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-800 to-transparent" />*/}
      </section>
    </div>
  </element>
  <element
    id="a2cce4ae-2b48-489e-b62e-35220c56c9c6"
    data-section-id="a2cce4ae-2b48-489e-b62e-35220c56c9c6"
  >
    <div id="root">
      <section id="featuredCampaigns" className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate__animated animate__fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Featured Campaigns
            </h2>
            <p className="text-neutral-600 text-lg">
              Support these impactful projects making a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Campaign Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp">
              <img
                src="https://dealsbe.com/media/50/conversions/01JB9Z454NPE7NRVAQQ0QKYM15-thumb.jpg"
                alt="Campaign"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Creator"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-semibold">Sarah Johnson</p>
                    <p className="text-xs text-neutral-500">California, USA</p>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Education for All</h3>
                <div className="mb-4">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-accent w-3/4 h-2 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-neutral-600">$15,000 raised</span>
                    <span className="text-neutral-600">75%</span>
                  </div>
                </div>
                <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-md">
                  Support Now
                </button>
              </div>
            </div>
            {/* Campaign Card 2 */}
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <img
                src="https://dealsbe.com/media/51/conversions/01JB9Z5JRAT9BKY3KZSM8225YQ-thumb.jpg"
                alt="Campaign"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Creator"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-semibold">Mark Davis</p>
                    <p className="text-xs text-neutral-500">London, UK</p>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Clean Water Project</h3>
                <div className="mb-4">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-accent w-1/2 h-2 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-neutral-600">$10,000 raised</span>
                    <span className="text-neutral-600">50%</span>
                  </div>
                </div>
                <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-md">
                  Support Now
                </button>
              </div>
            </div>
            {/* Campaign Card 3 */}
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <img
                src="https://dealsbe.com/media/52/conversions/01JB9Z6JAJZE9V2WN4AKKET7TE-thumb.jpg"
                alt="Campaign"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Creator"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-semibold">Emma Wilson</p>
                    <p className="text-xs text-neutral-500">Sydney, AUS</p>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Save the Forest</h3>
                <div className="mb-4">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-accent w-4/5 h-2 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-neutral-600">$20,000 raised</span>
                    <span className="text-neutral-600">80%</span>
                  </div>
                </div>
                <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-md">
                  Support Now
                </button>
              </div>
            </div>
            {/* Campaign Card 4 */}
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.6s" }}
            >
              <img
                src="https://dealsbe.com/media/53/conversions/01JB9Z7QP4A1WTXAP16PCVJD6Q-thumb.jpg"
                alt="Campaign"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Creator"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-semibold">Alex Brown</p>
                    <p className="text-xs text-neutral-500">Toronto, CA</p>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Tech for Kids</h3>
                <div className="mb-4">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-accent w-2/3 h-2 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-neutral-600">$12,000 raised</span>
                    <span className="text-neutral-600">60%</span>
                  </div>
                </div>
                <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-md">
                  Support Now
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
        <Link to="/campaigns">
          <button className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-300">
            View All Campaigns
          </button>
        </Link>
       </div>
        </div>
      </section>
    </div>
  </element>
  <element
    id="ec4c8863-c331-43bc-ba62-9fc2c9f0d820"
    data-section-id="ec4c8863-c331-43bc-ba62-9fc2c9f0d820"
  >
    <div id="root">
      <section id="categories" className="py-20 bg-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate__animated animate__fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse by Categories
            </h2>
            <p className="text-neutral-300 text-lg">
              Discover projects that match your interests
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Development Category */}
            <div className="bg-neutral-700 rounded-xl p-6 hover:bg-neutral-600 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="https://dealsbe.com/media/1/Development.svg"
                  alt="Development"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Education
              </h3>
              <p className="text-neutral-300 text-center text-sm">
                24 active projects
              </p>
            </div>
            {/* Data Category */}
            <div
              className="bg-neutral-700 rounded-xl p-6 hover:bg-neutral-600 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src="https://dealsbe.com/media/2/Data.svg"
                  alt="Data"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Healthcare
              </h3>
              <p className="text-neutral-300 text-center text-sm">
                19 active projects
              </p>
            </div>
            {/* Marketing Category */}
            <div
              className="bg-neutral-700 rounded-xl p-6 hover:bg-neutral-600 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src="https://dealsbe.com/media/3/Marketing.svg"
                  alt="Marketing"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Environment
              </h3>
              <p className="text-neutral-300 text-center text-sm">
                14 active projects
              </p>
            </div>
            {/* AI Category */}
            <div
              className="bg-neutral-700 rounded-xl p-6 hover:bg-neutral-600 transition-all duration-300 cursor-pointer animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src="https://dealsbe.com/media/4/AI.svg"
                  alt="AI"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Technology
              </h3>
              <p className="text-neutral-300 text-center text-sm">
                11 active projects
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <button className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300">
              Animal Welfare
            </button>
            <button className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300">
              Community
            </button>
            <button className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300">
              Arts &amp; Culture
            </button>
            <button className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300">
              Innovation
            </button>
            <button className="bg-neutral-600 hover:bg-neutral-500 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300">
              Sports
            </button>
          </div>
        </div>
      </section>
    </div>
  </element>
  <element
    id="6a35c668-b55f-48d8-98bb-e5a21a750d41"
    data-section-id="6a35c668-b55f-48d8-98bb-e5a21a750d41"
  >
    <div id="root">
      <section id="howItWorks" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate__animated animate__fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How Impacta Works
            </h2>
            <p className="text-neutral-600 text-lg">
              Simple steps to start making a difference
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center animate__animated animate__fadeInUp">
              <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <img
                  src="https://dealsbe.com/media/1/Development.svg"
                  alt="Create"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                1. Create Your Campaign
              </h3>
              <p className="text-neutral-600">
                Set up your campaign in minutes. Add your story, photos, and
                funding goal to get started.
              </p>
            </div>
            {/* Step 2 */}
            <div
              className="text-center animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <img
                  src="https://dealsbe.com/media/2/Data.svg"
                  alt="Share"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                2. Share Your Story
              </h3>
              <p className="text-neutral-600">
                Share your campaign with friends, family, and our supportive
                community.
              </p>
            </div>
            {/* Step 3 */}
            <div
              className="text-center animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <img
                  src="https://dealsbe.com/media/3/Marketing.svg"
                  alt="Collect"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                3. Start Making Impact
              </h3>
              <p className="text-neutral-600">
                Receive donations, track progress, and keep supporters updated
                on your journey.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg font-semibold animate__animated animate__pulse animate__infinite">
              Start Your Campaign Now
            </button>
            <p className="mt-4 text-neutral-600">
              No hidden fees. Get started in minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  </element>
  <element
    id="4e135795-1661-4086-85e2-477f768a5a99"
    data-section-id="4e135795-1661-4086-85e2-477f768a5a99"
  >
    <div id="root">
      <section id="successStories" className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate__animated animate__fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Success Stories
            </h2>
            <p className="text-neutral-600 text-lg">
              Real impact stories from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Success Story 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp">
              <img
                src="https://dealsbe.com/media/50/conversions/01JB9Z454NPE7NRVAQQ0QKYM15-thumb.jpg"
                alt="Success Story"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Completed
                  </div>
                  <div className="ml-2 text-neutral-500 text-sm">
                    $50,000 raised
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">
                  Local School Library Renovation
                </h3>
                <p className="text-neutral-600 mb-4">
                  "Thanks to the amazing community, we were able to renovate our
                  entire library and provide new books for our students."
                </p>
                <div className="flex items-center">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Emily Parker</p>
                    <p className="text-sm text-neutral-500">School Principal</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Success Story 2 */}
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <img
                src="https://dealsbe.com/media/51/conversions/01JB9Z5JRAT9BKY3KZSM8225YQ-thumb.jpg"
                alt="Success Story"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Completed
                  </div>
                  <div className="ml-2 text-neutral-500 text-sm">
                    $75,000 raised
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">
                  Community Garden Project
                </h3>
                <p className="text-neutral-600 mb-4">
                  "Our community now has a beautiful garden where we can grow
                  fresh produce and bring people together."
                </p>
                <div className="flex items-center">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-neutral-500">Project Leader</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Success Story 3 */}
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <img
                src="https://dealsbe.com/media/52/conversions/01JB9Z6JAJZE9V2WN4AKKET7TE-thumb.jpg"
                alt="Success Story"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Completed
                  </div>
                  <div className="ml-2 text-neutral-500 text-sm">
                    $30,000 raised
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2">Youth Tech Program</h3>
                <p className="text-neutral-600 mb-4">
                  "We've equipped 100 students with laptops and coding skills
                  for their future careers."
                </p>
                <div className="flex items-center">
                  <img
                    src="https://dealsbe.com/images/logo.svg"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">Sarah Thompson</p>
                    <p className="text-sm text-neutral-500">Program Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <button className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-300">
              View More Success Stories
            </button>
          </div>
        </div>
      </section>
    </div>
  </element>
  <element
    id="49d5b940-4418-4a63-b421-5c2c482788d1"
    data-section-id="49d5b940-4418-4a63-b421-5c2c482788d1"
  >
    <div id="root">
    <section id="startCampaign" className="py-20 bg-neutral-900 text-white flex justify-center">
  <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
    
    {/* Left Side - Text + Features */}
    <div className="animate__animated animate__fadeInLeft">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Ready to Make a Difference?
      </h2>
      <p className="text-xl text-neutral-300 mb-8">
        Start your campaign today and join thousands of changemakers who
        are creating positive impact worldwide.
      </p>

      {/* Feature List */}
      {/* Feature List */}

<div className="space-y-4">
  <div className="flex items-center bg-neutral-800 p-4 rounded-lg">
    <img src="https://dealsbe.com/media/1/Development.svg" alt="icon" className="w-8 h-8 mr-4" />
    <p className="text-lg">Set up your campaign in minutes</p>
  </div>

  <div className="flex items-center bg-neutral-800 p-4 rounded-lg">
    <img src="https://dealsbe.com/media/2/Data.svg" alt="icon" className="w-8 h-8 mr-4" />
    <p className="text-lg">Share with your network easily</p>
  </div>

  <div className="flex items-center bg-neutral-800 p-4 rounded-lg">
    <img src="https://dealsbe.com/media/3/Marketing.svg" alt="icon" className="w-8 h-8 mr-4" />
    <p className="text-lg">Manage donations securely</p>
  </div>
</div>



      {/* CTA Button */}
      <div className="mt-10">
        <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg font-semibold">
          Start Your Campaign
        </button>
        <p className="text-neutral-400 text-sm mt-2">
          No hidden fees. 24/7 support available.
        </p>
      </div>
    </div>

    {/* Right Side - Image + Floating Cards */}
    <div className="relative flex justify-center">
      <img src="https://dealsbe.com/images/banner.svg" alt="Campaign" className="w-full max-w-lg" />

      {/* Floating Cards */}
      <div className="absolute top-4 right-4 bg-white text-neutral-900 p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <img src="https://dealsbe.com/images/logo.svg" className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-bold">$1M+ Raised</p>
            <p className="text-sm text-neutral-600">This Month</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-accent p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <img src="https://dealsbe.com/images/logo.svg" className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-bold">1000+ Projects</p>
            <p className="text-sm">Successfully Funded</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

    </div>
  </element>
  <element
    id="ad5a14cb-93c8-4631-b16a-8f841b09a3f2"
    data-section-id="ad5a14cb-93c8-4631-b16a-8f841b09a3f2"
  >
    <div id="root">
      <section id="testimonials" className="py-20 bg-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate__animated animate__fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Community Says
            </h2>
            <p className="text-neutral-300 text-lg">
              Join thousands of satisfied campaigners and donors
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-neutral-700 p-8 rounded-lg animate__animated animate__fadeInUp">
              <div className="flex items-center mb-6">
                <img
                  src="https://dealsbe.com/media/50/conversions/01JB9Z454NPE7NRVAQQ0QKYM15-thumb.jpg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold">David Wilson</h4>
                  <p className="text-neutral-300 text-sm">Campaign Creator</p>
                </div>
              </div>
              <p className="text-neutral-200 mb-4">
                "Impacta made it incredibly easy to set up my campaign. The
                support team was amazing, and we reached our goal in just 3
                weeks!"
              </p>
              <div className="flex text-yellow-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div
              className="bg-neutral-700 p-8 rounded-lg animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center mb-6">
                <img
                  src="https://dealsbe.com/media/51/conversions/01JB9Z5JRAT9BKY3KZSM8225YQ-thumb.jpg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold">Sarah Martinez</h4>
                  <p className="text-neutral-300 text-sm">Regular Donor</p>
                </div>
              </div>
              <p className="text-neutral-200 mb-4">
                "I love how transparent and secure the donation process is.
                Being able to see the direct impact of my contributions is
                really rewarding."
              </p>
              <div className="flex text-yellow-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div
              className="bg-neutral-700 p-8 rounded-lg animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center mb-6">
                <img
                  src="https://dealsbe.com/media/52/conversions/01JB9Z6JAJZE9V2WN4AKKET7TE-thumb.jpg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold">James Cooper</h4>
                  <p className="text-neutral-300 text-sm">Non-Profit Partner</p>
                </div>
              </div>
              <p className="text-neutral-200 mb-4">
                "Impacta has revolutionized how we raise funds for our causes.
                The platform's features and community support are unmatched."
              </p>
              <div className="flex text-yellow-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </element>
  <element
    id="7c1055e4-fe22-45da-8b87-4ba5c368dc37"
    data-section-id="7c1055e4-fe22-45da-8b87-4ba5c368dc37"
  >
    <div id="root">
      <footer id="footer" className="bg-neutral-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <img
                  src="https://dealsbe.com/images/logo.svg"
                  alt="Impacta Logo"
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-bold">Impacta</span>
              </div>
              <p className="text-neutral-400 mb-4">
                Making a difference through community-powered fundraising.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/about"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/help"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold mb-6">Categories</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Education
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Healthcare
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Environment
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Technology
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
              <p className="text-neutral-400 mb-4">
                Subscribe to our newsletter for the latest updates and success
                stories.
              </p>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-accent"
                />
                <button className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded-lg transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 text-sm">
                © 2024 Impacta. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-neutral-400 hover:text-white text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-white text-sm"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-white text-sm"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </element>
  <div id="page_complete"></div>
</>

};

export default Home;
