import React from 'react';
import { Target, Shield, Users } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <h1 className="about-title">About Us</h1>

            <div className="card about-card">
                <
                    h2 className="about-subtitle">Our Mission</h2>
                <p className="about-description">
                    We aim to provide a transparent, secure, and efficient pawn broking management system that empowers businesses to manage their loans, customers, and inventory with ease. Our solution is built with modern technology to ensure reliability and speed.
                </p>

                <div className="about-grid">
                    <div className="about-item">
                        <div className="about-icon-wrapper bg-green">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3>Precision</h3>
                            <p>Accurate calculations for interest and valuations.</p>
                        </div>
                    </div>

                    <div className="about-item">
                        <div className="about-icon-wrapper bg-indigo">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3>Security</h3>
                            <p>Enterprise-grade data protection for your records.</p>
                        </div>
                    </div>

                    <div className="about-item">
                        <div className="about-icon-wrapper bg-purple">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3>Customer First</h3>
                            <p>Designed to improve customer service and retention.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="about-footer">
                <p>&copy; 2024 Pawn Broking Management System. Version 1.0.0</p>
            </div>
        </div>
    );
};

export default About;
