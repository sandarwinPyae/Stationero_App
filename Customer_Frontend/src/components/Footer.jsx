import React from 'react';
import { Link } from 'react-router-dom'; // Link ကို import လုပ်ပါ
import './Footer.css';

const Footer = () => {
      return (
            <footer className="footer-section">
                  <div className="container footer-container">
                        <div className="footer-col about-col">
                              <h4 className="footer-heading">ABOUT US</h4>
                              <p>
                                    For generations, this beloved<br />
                                    paper and stationery haven has<br />
                                    been a staple in the community,<br />
                                    offering creators, students, and<br />
                                    professionals access to a wide<br />
                                    array of fine papers, essential<br />
                                    office supplies, and creative<br />
                                    treasures.
                              </p>
                        </div>

                        <div className="footer-col links-col">
                              <h4 className="footer-heading">OUR STORES</h4>
                              <ul>
                                    {/* <a> tag အစား Link ကို သုံးပါ */}
                                    <li><Link to="/about">About us</Link></li>
                                    <li><Link to="/contact">Contact us</Link></li> 
                              </ul>
                        </div>

                        <div className="footer-col links-col">
                              <h4 className="footer-heading">INFORMATION</h4>
                              <ul>
                                    <li><Link to="/product">Product</Link></li>
                                    <li><a href="/#new-arrivals">New Arrivals</a></li>
        <li><a href="/#best-selling">Best Selling Products</a></li>
                              </ul>
                        </div>
                  </div>
            </footer>
      );
};

export default Footer;