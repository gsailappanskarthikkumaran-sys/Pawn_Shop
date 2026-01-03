import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-page">
            <h1 className="contact-title">Contact Us</h1>
            <div className="card contact-card">
                <p className="contact-description">
                    Have questions or need assistance? Reach out to our support team.
                </p>

                <div className="contact-grid">
                    <div className="contact-item">
                        <div className="contact-icon-wrapper icon-blue">
                            <Phone size={24} />
                        </div>
                        <h3>Phone</h3>
                        <p>+91 12345 67890</p>
                        <p className="contact-subtext">Mon-Sat, 10AM to 8PM</p>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon-wrapper icon-pink">
                            <Mail size={24} />
                        </div>
                        <h3>Email</h3>
                        <p>support@gmail.com</p>
                        <p className="contact-subtext">24/7 Support</p>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon-wrapper icon-yellow">
                            <MapPin size={24} />
                        </div>
                        <h3>Office</h3>
                        <p className="contact-subtext">123, North Street, West side,East Mambalam </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
