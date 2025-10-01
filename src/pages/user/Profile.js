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
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    const [formStatus, setFormStatus] = useState(0);
    const { user } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
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

    // Initialize form with user data when user is available
    useEffect(() => {
        if (user) {
            setForm({
                email: user.email || "",
                designation: user.designation || "",
                occlusion: user.occlusion || "",
                labname: user.labname || "",
                mobile: user.mobile || "",
                anatomy: user.anatomy || "",
                contact: user.contact || "",
                pontic: user.pontic || "",
                password: "", // Always start with empty password
                remark: user.remark || "",
            });
        }
    }, [user]);

    const handleProfile = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormStatus(formStatus + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', form);

        try {
            const response = await fetch('http://localhost/bravodent_ci/update-user', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            const resp = await response.json();
            console.log(resp);

        } catch (error) {
            console.error("Error submitting:", error);
        }
    };


    // Check if user is null, undefined, or empty
    if (!user || Object.keys(user).length === 0) {
        return (
            <>
                <Hd />
                <main className="min-h-screen bg-gray-50 py-22">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-center items-center min-h-96">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-16 h-16 text-yellow-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
                                <p className="text-gray-600">Please log in to view your profile.</p>
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
            <main className="min-h-screen bg-gray-50 py-22">
                {/* Header Section */}
                <header className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-3xl font-bold text-gray-800">
                                    Profile Overview
                                </h1>
                                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                            </div>
                            <nav className="flex">
                                <ol className="flex items-center space-x-3 text-sm">
                                    <li>
                                        <Link to="/user/home" className="text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center">
                                            <FontAwesomeIcon icon={faHome} className="w-3 h-3 mr-2" />
                                            Home
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mx-2 text-gray-400">/</span>
                                        <span className="text-blue-600 font-semibold">{user.name}</span>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="container mx-auto py-8">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                        {/* Left Sidebar - Profile Card */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                {/* Profile Image */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div className="relative">
                                            {!user.pic || user.pic === '' ? (
                                                <img
                                                    className="w-32 h-32 rounded-xl mx-auto border-4 border-blue-100 shadow-md"
                                                    src="/img/user.webp"
                                                    alt="User profile"
                                                />
                                            ) : (
                                                <img
                                                    className="w-32 h-32 rounded-xl mx-auto border-4 border-blue-100 shadow-md object-cover"
                                                    src={`../${user.pic}`}
                                                    alt="User profile"
                                                />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mt-4 text-gray-800">
                                        {user.name || 'User'}
                                    </h3>
                                    <p className="text-blue-600 text-sm mt-1 font-medium">Professional Account</p>
                                    <div className="flex items-center justify-center mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                        <span className="text-green-600 text-xs font-medium">Online</span>
                                    </div>
                                </div>

                                {/* Client Info */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium flex items-center">
                                            <FontAwesomeIcon icon={faIdCard} className="w-3 h-3 text-blue-500 mr-2" />
                                            Client ID
                                        </span>
                                        <span className="text-gray-800 font-semibold bg-blue-50 px-2 py-1 rounded-md">
                                            #{user.userid}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium flex items-center">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-purple-500 mr-2" />
                                            Member Since
                                        </span>
                                        <span className="text-gray-800 font-semibold">
                                            {user.joining_date || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Button */}
                                {user.acpinid !== 0 ? (
                                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 mb-6 shadow-md flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                        Account Activated
                                    </button>
                                ) : (
                                    <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 mb-6 shadow-md">
                                        Account Inactive
                                    </button>
                                )}

                                {/* Profile Picture Upload */}
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faCamera} className="w-3 h-3 mr-2 text-blue-500" />
                                            Update Profile Picture
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                name="profile_pic"
                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <input type="hidden" name="client_id" value={user.email || ''} />
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center"
                                    >
                                        <FontAwesomeIcon icon={faCamera} className="w-4 h-4 mr-2" />
                                        Upload New Picture
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Content - Personal Details */}
                        <div className="xl:col-span-3">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* Tab Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <nav className="flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab('personal')}
                                            className={`font-semibold pb-3 px-2 border-b-2 transition-all duration-300 flex items-center ${activeTab === 'personal'
                                                ? 'text-blue-600 border-blue-600'
                                                : 'text-gray-500 border-transparent hover:text-blue-500'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2" />
                                            Personal Details
                                        </button>
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <input type="hidden" name="email" value={form.email} />

                                        {/* Two Column Grid Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                            {/* Row 1 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faUserTie} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Designation
                                                </label>
                                                <input
                                                    type="text"
                                                    name="designation"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.designation}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500 focus:outline-none transition-all duration-300 cursor-not-allowed"
                                                    value={form.email}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Row 2 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Occlusion
                                                </label>
                                                <input
                                                    type="text"
                                                    name="occlusion"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.occlusion}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faFlask} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Lab Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="labname"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.labname}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 3 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Mobile Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.mobile}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Anatomy
                                                </label>
                                                <input
                                                    type="text"
                                                    name="anatomy"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.anatomy}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 4 */}
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Contact
                                                </label>
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.contact}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faStethoscope} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Pontic
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pontic"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    value={form.pontic}
                                                    onChange={handleProfile}
                                                />
                                            </div>

                                            {/* Row 5 - Password field with eye button */}
                                            <div className="lg:col-span-2 flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 pr-12"
                                                        placeholder="Enter new password"
                                                        value={form.password}
                                                        onChange={handleProfile}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300 p-1"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={showPassword ? faEyeSlash : faEye}
                                                            className="w-5 h-5"
                                                        />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-blue-400 mr-1" />
                                                    Leave blank to keep current password
                                                </p>
                                            </div>

                                            {/* Row 6 - Remarks field */}
                                            <div className="lg:col-span-2 flex flex-col space-y-2">
                                                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center">
                                                    <FontAwesomeIcon icon={faNotesMedical} className="w-3 h-3 text-blue-500 mr-2" />
                                                    Remarks & Notes
                                                </label>
                                                <textarea
                                                    name="remark"
                                                    rows="4"
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-vertical"
                                                    value={form.remark}
                                                    onChange={handleProfile}
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-6 border-t border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="text-sm text-gray-500">
                                                    Last updated: {user.joining_date}
                                                </div>
                                                <button
                                                    disabled={formStatus === 0}
                                                    type="submit"
                                                    className={`bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center ${formStatus === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}>
                                                    <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                                                    Save All Changes
                                                </button>

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