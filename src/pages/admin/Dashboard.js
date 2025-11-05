import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHardDrive,
    faDatabase,
    faMemory,
    faGauge,
} from "@fortawesome/free-solid-svg-icons";

import Sidebar from "./Sidebar";
import Hd from "./Hd";

export default function Dashboard() {
    const filesystems = [
        { fs: "/dev/root", size: "484G", used: "350G", avail: "135G", use: "73%", mounted: "/" },
        { fs: "tmpfs", size: "956M", used: "0", avail: "956M", use: "0%", mounted: "/dev/shm" },
        { fs: "efivarfs", size: "128K", used: "3.8K", avail: "120K", use: "4%", mounted: "/sys/firmware/efi/efivars" },
        { fs: "tmpfs", size: "383M", used: "36M", avail: "347M", use: "10%", mounted: "/run" },
        { fs: "tmpfs", size: "5.0M", used: "0", avail: "5.0M", use: "0%", mounted: "/run/lock" },
        { fs: "/dev/nvme0n1p16", size: "881M", used: "151M", avail: "669M", use: "19%", mounted: "/boot" },
        { fs: "/dev/nvme0n1p15", size: "105M", used: "6.2M", avail: "99M", use: "6%", mounted: "/boot/efi" },
    ];

    return (
        <>
            <Hd />
            <div className="min-h-screen flex bg-gray-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGauge} className="text-blue-500" />
                            Dashboard
                        </h1>
                        <p className="text-gray-500">Server Configuration Overview</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                            <FontAwesomeIcon icon={faHardDrive} className="text-3xl text-blue-500 mb-2" />
                            <h3 className="text-gray-700 text-sm">Total Disk Space</h3>
                            <p className="text-2xl font-semibold text-gray-800">484G</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                            <FontAwesomeIcon icon={faDatabase} className="text-3xl text-orange-500 mb-2" />
                            <h3 className="text-gray-700 text-sm">Used Space</h3>
                            <p className="text-2xl font-semibold text-gray-800">350G</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
                            <FontAwesomeIcon icon={faMemory} className="text-3xl text-green-500 mb-2" />
                            <h3 className="text-gray-700 text-sm">Available Space</h3>
                            <p className="text-2xl font-semibold text-gray-800">135G</p>
                        </div>
                    </div>

                    {/* Filesystem Table */}
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="py-3 px-4 text-left">Filesystem</th>
                                    <th className="py-3 px-4 text-left">Size</th>
                                    <th className="py-3 px-4 text-left">Used</th>
                                    <th className="py-3 px-4 text-left">Avail</th>
                                    <th className="py-3 px-4 text-left">Use%</th>
                                    <th className="py-3 px-4 text-left">Mounted on</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filesystems.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">{item.fs}</td>
                                        <td className="py-3 px-4">{item.size}</td>
                                        <td className="py-3 px-4">{item.used}</td>
                                        <td className="py-3 px-4">{item.avail}</td>
                                        <td className="py-3 px-4">{item.use}</td>
                                        <td className="py-3 px-4">{item.mounted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </>
    );
}
