import React, { useState } from 'react'
import { useNavigate } from "react-router";
import toast from 'react-hot-toast';
import api from '../lib/axios';

const HomePage = () => {
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (adminName === '' || adminPassword === '') {
            toast.error('Please fill in all fields');
            return;
        }
        const res = await api.post('/admin/login', { adminName, adminPassword });
        const data = res.data;
        if (data.success) {
            localStorage.setItem('adminName', adminName);
            toast.success('Admin Login successfully!');
            navigate('/admin');
        } else {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div data-theme="night" className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-2">
            <h1 className="mb-8 text-3xl sm:text-4xl font-bold text-primary text-center">Welcome to Progress Point</h1>
            <section className="bg-base-100 w-full max-w-md px-4 py-6 sm:px-8 rounded-xl shadow-lg">
                <h2 className="mb-6 text-xl sm:text-2xl font-semibold text-secondary text-center">Admin Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Admin Name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                        className="input input-bordered w-full"
                    />
                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="input input-bordered w-full"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                    >
                        Get Started
                    </button>
                </form>
            </section>
        </div>
    );
};

export default HomePage;