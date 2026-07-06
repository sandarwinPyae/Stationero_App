import React from 'react';
import './AboutUs.css';
// Navbar ကို StationeroPage ထဲကနေ လှမ်း Import လုပ်ပါတယ် (Curly Braces {} ပါရပါမယ်)
import { StationeroNavbar } from './StationeroPage';
import { Link } from 'react-router-dom';



import { motion } from 'framer-motion'; // Animation အတွက်


const AboutUs = () => {
      const teamMembers = [
            { name: 'Sandar Win Pyae' },
            { name: 'Hnin Eaindra Khine' },
            { name: 'Kaung Yu Thant' },
            { name: 'Theingi Win Pyae' },
      ];

      return (
            <div className="about-us-page">

                  <StationeroNavbar  showSearch={false} />
                  <div className="about-container">
                        {/* About Stationero Section */}
                        <section className="about-box">
                              <h2 className="about-title">About Stationero</h2>
                              <p className="about-description">
                                    Stationero is a modern, all-in-one Sale and Inventory Management System built specifically for stationery shops. We simplify the complexities of tracking everything from notebooks and pens to art supplies, while streamlining your daily sales and business growth through an intuitive digital platform. Whether you are handling fast-moving retail checkout counters or managing bulk warehouse stock, Stationero keeps your stationery business seamless, accurate, and perfectly organized.
                              </p>

                              <div className="mission-commitment-row">
                                    <div className="mc-card">
                                          <h3 className="mc-title-pink">Our Mission</h3>
                                          <p>To empower businesses with smart, reliable, and data-driven management tools that eliminate human error, optimize stock control, and drive sustainable sales growth.</p>
                                    </div>
                                    <div className="mc-card">
                                          <h3 className="mc-title-pink">Our Commitment</h3>
                                          <p>We are dedicated to providing an efficient, secure, and highly accessible system that adapts to your business needs. Through continuous innovation and user-centric design, we commit to saving your time, reducing operational costs, and giving you the ultimate peace of mind in managing your day-to-day business.</p>
                                    </div>
                              </div>
                        </section>

                        {/* Meet Our Team Section */}
                        <section className="about-box team-box">
                              <h2 className="about-title">Meet Our Team</h2>
                              <p className="team-description">
                                    Stationero is built by a passionate team of Computer Science students, blending software engineering with modern UI/UX design. By combining robust backend architecture, intuitive frontend design, and thorough system analysis, we deliver a smart, reliable inventory solution tailored to simplify daily stationery business management.
                              </p>

                              <div className="team-grid">
                                    {teamMembers.map((member, index) => (
                                          <motion.div
                                                key={index}
                                                className="team-member"
                                                whileHover={{ scale: 1.05 }} // Mouse တင်ရင် ကြီးလာမယ့် Animation
                                          >
                                                {/* Anime ပုံများ */}
                                                <img
                                                      src={`https://api.dicebear.com/9.x/anime/svg?seed=${member.name}`}
                                                      alt={member.name}
                                                      className="team-img"
                                                />
                                                <p className="team-name">{member.name}</p>
                                          </motion.div>
                                    ))}
                              </div>
                        </section>

                        <footer className="about-footer">©2026 Stationero. All rights reserved.</footer>
                  </div>
            </div>
      );
};
export default AboutUs;