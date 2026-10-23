"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./contact.module.css";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.container}>
        {/* Content Section */}
        <div className={styles.contentBlock}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> &gt;{" "}
            <span className={styles.breadcrumbCurrent}>Contact Us</span>
          </div>

          <h1 className={styles.pageTitle}>Contact Us</h1>

          <div className={styles.cardList}>
            {/* Card 1: Chat with us (WhatsApp) */}
            <a
              href="https://wa.me/918606464700?text=Hello%20Occassions%20Florist,%20I%20would%20like%20to%20inquire%20about%20flowers."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactCard}
            >
              <span className={`${styles.cardIcon} ${styles.cardIconWhatsApp}`}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.56 14.39C16.31 14.26 15.09 13.66 14.86 13.58C14.64 13.49 14.47 13.45 14.31 13.7C14.14 13.95 13.67 14.51 13.53 14.68C13.38 14.84 13.24 14.86 12.99 14.74C12.74 14.61 11.94 14.35 10.99 13.5C10.25 12.84 9.75 12.02 9.6 11.78C9.46 11.53 9.59 11.39 9.71 11.27C9.82 11.16 9.96 10.99 10.08 10.84C10.21 10.7 10.25 10.59 10.33 10.43C10.42 10.26 10.37 10.12 10.31 10C10.25 9.87 9.75 8.65 9.54 8.15C9.34 7.66 9.14 7.72 8.98 7.71H8.5C8.33 7.71 8.07 7.77 7.84 8.02C7.62 8.27 6.99 8.86 6.99 10.07C6.99 11.27 7.86 12.44 7.99 12.6C8.11 12.77 9.71 15.24 12.17 16.3C12.75 16.55 13.21 16.7 13.56 16.81C14.15 17 14.69 16.97 15.11 16.91C15.58 16.84 16.56 16.32 16.76 15.74C16.97 15.17 16.97 14.68 16.9 14.58C16.84 14.47 16.7 14.41 16.56 14.39Z" />
                </svg>
              </span>
              <span className={styles.chatLinkText}>Chat with us</span>
            </a>

            {/* Card 2: Email */}
            <a
              href="mailto:occassions.flowers@gmail.com"
              className={styles.contactCard}
            >
              <span className={styles.cardIcon}>
                <Mail size={20} strokeWidth={1.8} />
              </span>
              <span className={styles.cardText}>
                Email: <strong>occassions.flowers@gmail.com</strong>
              </span>
            </a>

            {/* Card 3: Address */}
            <a
              href="https://maps.google.com/?q=Occasions+Florist+Kannur+Road+Calicut"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactCard}
            >
              <span className={styles.cardIcon}>
                <MapPin size={20} strokeWidth={1.8} />
              </span>
              <span className={styles.cardText}>
                Shop Address:{" "}
                <strong>
                  Near Y.M.C.A. Junction, Opp. HDFC Bank, Kannur Road, Calicut, Kerala 673001
                </strong>
              </span>
            </a>

            {/* Card 4: Call us */}
            <a href="tel:+918606464700" className={styles.contactCard}>
              <span className={styles.cardIcon}>
                <Phone size={20} strokeWidth={1.8} />
              </span>
              <span className={styles.cardText}>
                Call us: <strong>+91 8606 464 700</strong>
              </span>
            </a>

            {/* Card 5: Two columns for support timings */}
            <div className={styles.timingGrid}>
              <div className={styles.timingCard}>
                <span className={styles.timingLabel}>Call &amp; Email Support</span>
                <span className={styles.timingValue}>8:00 AM – 10:00 PM</span>
              </div>
              <div className={styles.timingCard}>
                <span className={styles.timingLabel}>WhatsApp Support</span>
                <span className={styles.timingValue}>8:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
