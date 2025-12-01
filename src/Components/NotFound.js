export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating geometric shapes */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-3xl rotate-12 animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-1/4 right-10 w-48 h-48 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-2xl -rotate-6 animate-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute bottom-32 left-1/4 w-32 h-32 bg-gradient-to-bl from-emerald-100/15 to-teal-100/10 rounded-xl rotate-45 animate-float" style={{ animationDelay: '2.5s' }}></div>
                
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
            </div>

            <div className="max-w-2xl w-full space-y-12 text-center relative z-10">
                {/* Main 404 display */}
                <div className="relative mb-8">
                    <div className="relative inline-block">
                        {/* Outer glow effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl animate-pulse"></div>
                        
                        {/* Main number */}
                        <div className="relative">
                            <div className="text-[180px] sm:text-[220px] font-black leading-none tracking-tighter">
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                    404
                                </span>
                            </div>
                            
                            {/* Floating particles */}
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-float"></div>
                            <div className="absolute -bottom-2 left-1/4 w-6 h-6 bg-purple-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-pink-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                        </div>
                    </div>
                    
                    {/* Shadow text for depth */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <div className="text-[180px] sm:text-[220px] font-black leading-none tracking-tighter text-gray-200/40 dark:text-gray-700/40">
                            404
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Title and description */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Lost in Space
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
                            The page you're looking for has drifted into the cosmic void. 
                            Let's navigate back to familiar territory.
                        </p>
                    </div>

                    {/* Decorative line */}
                    <div className="relative py-4">
                        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        <div className="relative inline-block">
                            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        <a
                            href="/"
                            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden min-w-[200px]"
                        >
                            {/* Button background effects */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Button content */}
                            <div className="relative flex items-center space-x-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="text-lg">Return to Home</span>
                            </div>
                        </a>

                        <button
                            onClick={() => window.history.back()}
                            className="group relative inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden min-w-[200px]"
                        >
                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Button content */}
                            <div className="relative flex items-center space-x-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-lg">Go Back</span>
                            </div>
                        </button>
                    </div>

                    {/* Search suggestion */}
                    <div className="pt-8">
                        <div className="inline-flex items-center space-x-3 px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">
                                Can't find what you need? Try searching from the homepage.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Floating elements at bottom */}
                <div className="pt-12">
                    <div className="flex justify-center space-x-2 opacity-30">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add the animation keyframes to global styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
                    50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}