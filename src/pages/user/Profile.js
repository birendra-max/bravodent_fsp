import { useContext, useState, useEffect } from 'react';
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from '../../Context/UserContext';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye,
    faEyeSlash,
    faCamera,
    faCheckCircle,
    faUser,
    faEnvelope,
    faPhone,
    faHome,
    faCalendarAlt,
    faSave,
    faIdCard,
    faUserTie,
    faFlask,
    faStethoscope,
    faNotesMedical,
    faKey,
    faExclamationTriangle,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    const [formStatus, setFormStatus] = useState(0);
    const { user, setUser } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        designation: "",
        occlusion: "",
        labname: "",
        mobile: "",
        anatomy: "",
        contact: "",
        pontic: "",
        password: "",
        remark: "",
    });

    // Fetch user data from backend on component mount
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost/bravodent_ci/get-user-profile', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
            });

            const data = await response.json();
            if (data.status === 'success') {
                setUser(data.user);
                setForm({
                    email: data.user.email || "",
                    designation: data.user.designation || "",
                    occlusion: data.user.occlusion || "",
                    labname: data.user.labname || "",
                    mobile: data.user.mobile || "",
                    anatomy: data.user.anatomy || "",
                    contact: data.user.contact || "",
                    pontic: data.user.pontic || "",
                    password: "",
                    remark: data.user.remark || "",
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("profile", file);

            try {
                setProfileLoading(true);
                const profileresp = await fetch("http://localhost/bravodent_ci/update-profile", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                const data = await profileresp.json();
                const statusEl = document.getElementById('profilestatus');
                if (data.status === 'success') {
                    statusEl.className = 'w-full px-2 sm:px-4 text-xs sm:text-sm font-bold text-green-700 text-center mb-2';
                    statusEl.innerText = data.message;
                    await fetchUserData();
                    setTimeout(() => {
                        statusEl.innerText = '';
                    }, 3000);
                } else {
                    statusEl.className = 'w-full px-2 sm:px-4 text-xs sm:text-sm font-bold text-red-700 text-center mb-2';
                    statusEl.innerText = data.message;
                }
            } catch (err) {
                const statusEl = document.getElementById('profilestatus');
                statusEl.className = 'w-full px-2 sm:px-4 text-xs sm:text-sm font-bold text-red-700 text-center mb-2';
                statusEl.innerText = 'Upload failed. Please try again.';
            } finally {
                setProfileLoading(false);
            }
        }
    };

    const handleProfile = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormStatus(formStatus + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch('http://localhost/bravodent_ci/update-user', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            const resp = await response.json();
            const statusEl = document.getElementById('status');
            if (resp.status === 'success') {
                statusEl.className = 'w-full px-2 sm:px-4 text-sm sm:text-base font-bold text-green-700 text-center mb-2';
                statusEl.innerText = resp.message;
                await fetchUserData();
                setTimeout(() => {
                    statusEl.innerText = '';
                }, 3000);
            } else {
                statusEl.className = 'w-full px-2 sm:px-4 text-sm sm:text-base font-bold text-red-700 text-center mb-2';
                statusEl.innerText = resp.message;
            }
        } catch (error) {
            const statusEl = document.getElementById('status');
            statusEl.className = 'w-full px-2 sm:px-4 text-sm sm:text-base font-bold text-red-700 text-center mb-2';
            statusEl.innerText = 'Update failed. Please try again.';
        } finally {
            setLoading(false);
        }
    };

    if (!user || Object.keys(user).length === 0) {
        return (
            <>
                <Hd />
                <main className="py-4 sm:py-8 px-3 sm:px-4 transition-colors duration-300 min-h-screen" id="main">
                    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                        <div className="flex justify-center items-center min-h-80 sm:min-h-96">
                            <div className="text-center px-4">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mb-3 sm:mb-4" />
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
                                <p className="text-gray-600 text-sm sm:text-base">Please log in to view your profile.</p>
                            </div>
                        </div>
                    </div>
                </main>
                <Foot />
            </>
        );
    }

    return (
        <>
            <Hd />
            <main className="min-h-screen bg-gray-100 sm:bg-gray-200 py-14 sm:py-18">
                {/* Header Section */}
                <header className="bg-white border-b border-gray-200 shadow-sm px-4">
                    <div className="container mx-auto px-3 sm:px py-4 sm:py-3">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                    Profile Overview
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account settings and preferences</p>
                            </div>
                            <nav className="flex justify-center sm:justify-start">
                                <ol className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                                    <li>
                                        <Link to="/user/home" className="text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center">
                                            <FontAwesomeIcon icon={faHome} className="w-3 h-3 mr-1 sm:mr-2" />
                                            <span className="hidden xs:inline">Home</span>
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                                        <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-none">
                                            {user.name}
                                        </span>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="mx-auto py-4 sm:py-4 px-3 sm:px-4">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-4">

                        {/* Left Sidebar - Profile Card */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-4 sm:p-6">
                                {/* Profile Image */}
                                <div className="text-center mb-4 sm:mb-6">
                                    <div className="relative inline-block">
                                        <div className="relative">
                                            {!user.pic || user.pic === '' ? (
                                                <img
                                                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl mx-auto border-4 border-blue-100 shadow-md"
                                                    src="/img/user.webp"
                                                    alt="User profile"
                                                />
                                            ) : (
                                                <img
                                                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl mx-auto border-4 border-blue-100 shadow-md object-cover"
                                                    src={`${user.pic}`}
                                                    alt="User profile"
                                                />
                                            )}
                                            {profileLoading && (
                                                <div className="absolute inset-0 bg-white bg-opacity-70 rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white shadow-lg flex items-center justify-center">
                                            <FontAwesomeIcon icon={faCheckCircle} className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-bold mt-3 sm:mt-4 text-gray-800 truncate px-2">
                                        {user.name || 'User'}
                                    </h3>
                                    <p className="text-blue-600 text-xs sm:text-sm mt-1 font-medium">Professional Account</p>
                                    <div className="flex items-center justify-center mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                        <span className="text-green-600 text-xs font-medium">Online</span>
                                    </div>
                                </div>

                                {/* Client Info */}
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium flex items-center text-xs sm:text-sm">
                                            <FontAwesomeIcon icon={faIdCard} className="w-3 h-3 text-blue-500 mr-2" />
                                            Client ID
                                        </span>
                                        <span className="text-gray-800 font-semibold bg-blue-50 px-2 py-1 rounded-md text-xs sm:text-sm">
                                            #{user.userid}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium flex items-center text-xs sm:text-sm">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-purple-500 mr-2" />
                                            Member Since
                                        </span>
                                        <span className="text-gray-800 font-semibold text-xs sm:text-sm">
                                            {user.joining_date || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Button */}
                                {user.status !== 'active' ? (
                                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 mb-4 sm:mb-6 shadow-md flex items-center justify-center text-xs sm:text-sm">
                                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                        Active Your Account 
                                    </button>
                                ) : (
                                    <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 mb-4 sm:mb-6 shadow-md text-xs sm:text-sm">
                                       Inactive Your Account 
                                    </button>
                                )}

                                {/* Profile Picture Upload */}
                                <div className="space-y-3 sm:space-y-4">
                                    <p id="profilestatus" className="w-full text-center text-xs sm:text-sm"></p>
                                    <div>
                                        <label className="block text-gray-700 text-xs sm:text-sm font-semibold mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faCamera} className="w-3 h-3 mr-2 text-blue-500" />
                                            Update Profile Picture
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                name="profile_pic"
                                                accept='image/*'
                                                onChange={handleFileChange}
                                                disabled={profileLoading}
                                                className="w-full px-2 sm:px-3 py-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 file:mr-2 sm:file:mr-4 file:py-1 file:px-2 sm:file:px-3 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Personal Details */}
                        <div className="xl:col-span-3">
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 overflow-hidden">
                                {/* Tab Header */}
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                                    <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                                        <button
                                            onClick={() => setActiveTab('personal')}
                                            className={`font-semibold pb-2 sm:pb-3 px-2 border-b-2 transition-all duration-300 flex items-center whitespace-nowrap flex-shrink-0 ${
                                                activeTab === 'personal'
                                                    ? 'text-blue-600 border-blue-600'
                                                    : 'text-gray-500 border-transparent hover:text-blue-500'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            Personal Details
                                        </button>
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-4 sm:p-6">
                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                        <input type="hidden" name="email" value={form.email} />

                                        {/* Responsive Grid Layout */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Row 1 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faUserTie} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Designation
                                                </label>
                                                <input
                                                    type="text"
                                                    name="designation"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.designation}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500 focus:outline-none transition-all duration-300 cursor-not-allowed text-sm sm:text-base"
                                                    value={form.email}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Row 2 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Occlusion
                                                </label>
                                                <input
                                                    type="text"
                                                    name="occlusion"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.occlusion}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faFlask} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Lab Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="labname"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.labname}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 3 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Mobile Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.mobile}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Anatomy
                                                </label>
                                                <input
                                                    type="text"
                                                    name="anatomy"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.anatomy}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 4 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Contact
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.contact}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Pontic
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pontic"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                                                    value={form.pontic}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 5 - Password field with eye button */}
                                            <div className="md:col-span-2 flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base pr-10 sm:pr-12"
                                                        placeholder="Enter new password"
                                                        value={form.password}
                                                        onChange={handleProfile}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300 p-1"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={showPassword ? faEyeSlash : faEye}
                                                            className="w-4 h-4 sm:w-5 sm:h-5"
                                                        />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-blue-400 mr-1" />
                                                    Leave blank to keep current password
                                                </p>
                                            </div>

                                            {/* Row 6 - Remarks field */}
                                            <div className="md:col-span-2 flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faNotesMedical} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Remarks & Notes
                                                </label>
                                                <textarea
                                                    name="remark"
                                                    rows="3"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-vertical text-sm sm:text-base"
                                                    value={form.remark}
                                                    onChange={handleProfile}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-4 sm:pt-6 border-t border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                                                    Last updated: {user.joining_date}
                                                </div>
                                                <div className="flex flex-col items-stretch sm:items-end gap-2">
                                                    <p id="status" className="w-full text-center sm:text-right text-xs sm:text-sm"></p>
                                                    <button
                                                        disabled={formStatus === 0 || loading}
                                                        type="submit"
                                                        className={`cursor-pointer bg-blue-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center text-sm sm:text-base w-full sm:w-auto ${
                                                            formStatus === 0 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                                                        }`}>
                                                        {loading ? (
                                                            <>
                                                                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faSave} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                                                Save All Changes
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Foot />
        </>
    )
}