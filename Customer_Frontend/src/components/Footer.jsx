import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
      const navigate = useNavigate();

      const handleSectionClick = (sectionId) => {
            navigate(`/#${sectionId}`);
      };

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
                                    <li><Link to="/about">About us</Link></li>
                                    <li><Link to="/contact">Contact us</Link></li>
                              </ul>
                        </div>

                        <div className="footer-col links-col">
                              <h4 className="footer-heading">INFORMATION</h4>
                              <ul>
                                    <li><Link to="/product">Product</Link></li>
                                    <li>
                                          {/* ပြင်ဆင်ထားသော အပိုင်း */}
                                          <span
                                                className="footer-span-link"
                                                onClick={() => handleSectionClick('new-arrivals')}
                                          >
                                                New Arrivals
                                          </span>
                                    </li>
                                    <li>
                                          {/* ပြင်ဆင်ထားသော အပိုင်း */}
                                          <span
                                                className="footer-span-link"
                                                onClick={() => handleSectionClick('best-selling')}
                                          >
                                                Best Selling Products
                                          </span>
                                    </li>
                              </ul>
                        </div>
                  </div>
            </footer>
      );
};

export default Footer;