import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  ArrowRight,
  Building2
} from "lucide-react";
import api from '../lib/api';
import socket from "../services/socket";
import spcBackground from "../assets/spc.png";
import pgmNew from "../assets/pgmneww.jpg";
import spcReal from "../assets/spcreal.png";
import spcReal1 from "../assets/spcreal1.png";
import PublicAnnouncements from "./PublicAnnouncements";

// Static backgrounds array - moved outside component to avoid dependency warnings
const backgrounds = [
  spcBackground,
  spcReal,
  pgmNew,
  spcReal1,
];

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [openYear, setOpenYear] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [announcement, setAnnouncement] = useState(null);
  const [transactionDay, setTransactionDay] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get("/public/announcements");
        const announcements = res.data.announcements || [];
        setAnnouncement(announcements.length > 0 ? announcements[0] : null);
      } catch (error) {
        console.error('Error fetching announcement:', error);
        setAnnouncement(null);
      }
    };

    const fetchTransactionDays = async () => {
      try {
        const res = await api.get("/public/transaction-days");
        const transactionDays = res.data.transactionDays || [];
        setTransactionDay(transactionDays.length > 0 ? transactionDays[0] : null);
      } catch (error) {
        console.error('Error fetching transaction days:', error);
        setTransactionDay(null);
      }
    };

    fetchAnnouncement();
    fetchTransactionDays();

    // Socket listeners for real-time updates
    socket.on('announcementUpdated', fetchAnnouncement);
    socket.on('transactionDayUpdated', fetchTransactionDays);

    // Cleanup listeners on unmount
    return () => {
      socket.off('announcementUpdated', fetchAnnouncement);
      socket.off('transactionDayUpdated', fetchTransactionDays);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const missionContent = `The SPC Registrar's Office and Records Section is dedicated to maintaining academic integrity and records management tasks to support administrative processes and the institution's educational goals. We strive to facilitate student success, uphold academic standards, and foster a culture of continuous improvement.`;

  const visionContent = `To efficiently manage academic records and related administrative processes in support of the educational mission of San Pablo Colleges. Commitment to transparency, data security, and providing excellent service to students, faculty, staff, and other stakeholders.`;

  // Content pages for pagination (2 pages only)
  const contentPages = [
    {
      title: "The Macasaet Building Era & Leadership (1967-1981)",
      content: (
        <div className="space-y-6">
          <p>
            The rise of the Macasaet Building temporarily accommodated the Registrar's Office in its ground floor near the Accounting Section, which required the creation of the position of Assistant Registrar. Thus, Mr. Daniel Lorzano was the 1st Assistant Registrar with one year of stay in the office while Mr. Vicente Balandan was the 2nd Assistant Registrar. The clerks assisted them, namely: Mr. Danilo Exconde, Mr. Roleto Reyes, and Ms. Luz Caranto. Student Assistants were also with them: Linda Avanzado, Evangeline Calapine, Elma Alvero, Leonila (Mita) Suazo, Sally Avanzado, Melba Guia, and Necitas E. Aguason.
          </p>
          <p>
            In School Year 1967-1981, Mr. Enrique G. Lantican was the 8th College Registrar. He was a former Board member, treasurer and Principal of the High School Department and taught in the College Department. His assistants were Mr. Danilo Exconde, Mr. Roleto Reyes, and Mrs. Leonila S. Tyico, who replaced Ms. Luz Caranto. They were joined by more full-time clerks: Aureo Bacay, Feliciano Saliendra, Danilo Avanzado, Romanita Zomosa, Julita Rubiato, Juliet Exconde and Angelita Borgonia.
          </p>
          <p>
            With the employment of diligent staff, a goal-driven workforce was visible at the Registrar's Office and Records Section. All the active files were taken specifically from the elementary and high school departments. This year also witnessed the transfer of the Office of the Registrar to the basement of the Eatcon Building where the ROTC Office is housed now.
          </p>
        </div>
      )
    },
    {
      title: "Leadership Transitions to Present Day",
      content: (
        <div className="space-y-6">
          <p>
            Right after the retirement of Col. Jose B. Chozas from being the Records Custodian, he was retained as part-time Commandant in the High School Department. Mr. Severino Gomez replaced him and later Mr. Menand S. Macasaet. Meanwhile when Mr. Enrique G. Lantican left for abroad, Mrs. Leonila S. Tuico replaced him with the title of College Registrar. She rose from the rank as clerk, chief clerk, and the 3rd Assistant Registrar.
          </p>
          <p>
            From 1981 to date, Mrs. Leonia S. Tuico is the 3rd female and the 9th College Registrar. She heads this Office at the ground floor of the Macasaet Building. Over the years, this Office has grown and progressed as the school moves onward to accreditation and university status.
          </p>
          <p>
            After the retirement of Mrs. Tuico, the Assistant Registrar was promoted to Registrar and became the 10th College Registrar together with the roster of full-time staff: Mrs. Eliza M. Barte, Mrs. Gina L. Briones, Mr. Julius Dominic C. Flores, Ms. Ann Camille P. Diokno, and Ms. Armie O. Pantinople, assisted by ten student assistants to ensure prompt preparation of school records and smooth service flow.
          </p>
        </div>
      )
    }
  ];

  // Pagination functions
  const nextPage = () => {
    if (currentPage < contentPages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const historyData = [
    {
      year: '1948-1949',
      text: 'Mr. Te\' Adora Barleta was the 2nd School Registrar at the same time the Acting Secretary of the Board of Trustees. He was also a college instructor and Moderator of the Yearbook, Pillars 1949. He served the College up to SY 1951-1952.'
    },
    {
      year: '1952-1955',
      text: 'Atty. Enrique Capistrano was the 3rd School Registrar at the same time a faculty and Acting Secretary of the Board of Trustees.'
    },
    {
      year: '1955-1957',
      text: 'Mr. Jesus Manalili was the 4th School Registrar and the Dean of the College of Liberal Arts. Full-time clerks were designated at the Records Section: Nenita B. Reyes, Jose B. Chozas, Belen Alimario, Florida Castillo, and Mercedita Reyes.'
    },
    {
      year: '1958-1961',
      text: 'Atty. Democrito A. Bonilla was the 5th School Registrar, an instructor and the Principal of the High School Department.'
    },
    {
      year: '1961-1964',
      text: 'Mrs. Remedios Nunag was the 2nd female and the 6th School Registrar and took charge of the school Canteen.'
    },
    {
      year: '1964-1967',
      text: 'Atty. Vencedor A. Alimario was the 7th School Registrar. In his term, innovation in record filing was introduced. A systematic placement of records with individual alphabetical files facilitated verification and acquisition of student records. Included were inactive files taken from different offices like the library, the ROTC Office, canteens, etc.'
    }
  ];

  return (
    <div className="relative w-full overflow-x-hidden">

      {/* Hero Section */}
      <div className="relative z-10 w-full">

        {/* Main Hero Content */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 sm:py-0">
          {/* Background Slideshow with Fade Transition */}
          {backgrounds.map((bg, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ))}
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-white/60"></div>
          <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="truncate">SAN PABLO COLLEGES</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-700 mb-0 leading-tight px-2">
                DOCUMENT REQUEST SYSTEM
              </h1>
              <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-snug px-2">
                OFFICE OF THE REGISTRAR AND THE RECORDS SECTION
              </h2>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12 px-4">
              <Link
                to="/request"
                className="w-full sm:w-auto group bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center min-h-[48px] touch-manipulation"
              >
                <span className="truncate mr-2">Request Document</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
              <Link
                to="/track"
                className="w-full sm:w-auto group bg-white text-gray-800 border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center min-h-[48px] touch-manipulation"
              >
                <span className="truncate mr-2">Track Request</span>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* Public Announcement and Transaction Days Section */}
        <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Public Announcement Section */}
              <div>
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
                    PUBLIC ANNOUNCEMENT
                  </h2>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-100 min-h-[200px]">
                  {announcement ? (
                    <>
                      <h3 className="text-xl font-semibold text-green-800 mb-4">{announcement.title}</h3>
                      <p style={{ whiteSpace: "pre-line" }}>{announcement.content}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No announcement available</p>
                  )}
                </div>
              </div>

              {/* Transaction Days Section */}
              <div>
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
                    TRANSACTION DAYS
                  </h2>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-100 min-h-[200px]">
                  {transactionDay ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-green-800">Next Transaction Day</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transactionDay.status === 'available' ? 'bg-green-100 text-green-800' :
                          transactionDay.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transactionDay.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        <p className="font-medium">Date: {new Date(transactionDay.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                        {transactionDay.time_start && transactionDay.time_end && (
                          <p className="font-medium">Time: {transactionDay.time_start} - {transactionDay.time_end}</p>
                        )}
                        {transactionDay.message && (
                          <p className="mt-2 italic">{transactionDay.message}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No transaction days scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div id="history" className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-green-100 text-green-900">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Title Section */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-center text-green-800 mb-6 sm:mb-8 tracking-wide drop-shadow-sm px-2">
              THE HISTORY OF THE OFFICE OF THE REGISTRAR AND THE RECORDS SECTION
            </h1>

            {/* Introductory Paragraph */}
            <p className="text-base sm:text-lg text-justify leading-relaxed bg-white/70 p-4 sm:p-6 rounded-xl shadow-sm mx-2 sm:mx-0">
              In the school year 1946-1947 the school at the outset carried the name of Golden Gate Junior College and San Pablo Junior College. Later it was named San Pablo Colleges. Along the operation of the school, the Registrar's Office serves as the heart of the school system. This Office occupied the ground floor where the Farcon Building is standing today. Mrs. Pura Panganiban was the 1st School Registrar and Mr. Roman Cariaga assisted her. Both were College instructors.
            </p>

            {/* Dropdown Section */}
            <div className="bg-white/70 p-4 sm:p-6 rounded-xl shadow-sm mx-2 sm:mx-0">
              <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 sm:mb-4 px-2 sm:px-0">In the following school years:</h2>

              <div className="space-y-3 sm:space-y-4">
                {historyData.map((item, index) => (
                  <div key={index} className="bg-white/90 backdrop-blur-md border border-green-100 shadow-lg rounded-2xl overflow-hidden mx-2 sm:mx-0">
                    <button
                      onClick={() => setOpenYear(openYear === index ? null : index)}
                      className="w-full text-left px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-green-800 font-semibold hover:bg-green-100 transition flex justify-between items-center touch-manipulation min-h-[48px]"
                    >
                      <span className="text-sm sm:text-base">{item.year}</span>
                      <span className="text-lg sm:text-xl">{openYear === index ? '▲' : '▼'}</span>
                    </button>

                    {openYear === index && (
                      <div className="p-4 sm:p-6 text-green-900 text-justify border-t border-green-100 animate-expand">
                        <p className="text-sm sm:text-base leading-relaxed">{item.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Paginated Content */}
            <div className="bg-white/70 p-4 sm:p-6 rounded-xl shadow-sm mx-2 sm:mx-0">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 sm:mb-4 px-2 sm:px-0">
                  {contentPages[currentPage - 1].title}
                </h2>
                <div className="text-base sm:text-lg text-justify leading-relaxed text-green-900 px-2 sm:px-0">
                  {contentPages[currentPage - 1].content}
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-green-200 space-y-3 sm:space-y-0">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation min-h-[48px] ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                  }`}
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-2 order-first sm:order-none">
                  {contentPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index + 1)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-medium transition-colors touch-manipulation min-w-[40px] ${
                        currentPage === index + 1
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === contentPages.length}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation min-h-[48px] ${
                    currentPage === contentPages.length
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                  }`}
                >
                  Next →
                </button>
              </div>

              {/* Page Info */}
              <div className="text-center mt-3 sm:mt-4 text-sm text-green-700 px-2 sm:px-0">
                Page {currentPage} of {contentPages.length}
              </div>
            </div>
          </div>
        </div>

        {/* Mission and Vision Section */}
        <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
                MISSION & VISION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white border border-green-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-4 sm:mb-6 text-center uppercase tracking-wide">
                  MISSION
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg text-justify">
                  {missionContent}
                </p>
              </div>

              <div className="bg-white border border-green-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-4 sm:mb-6 text-center uppercase tracking-wide">
                  VISION
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg text-justify">
                  {visionContent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
                OBJECTIVES
              </h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md mx-2 sm:mx-0">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-green-700 mb-3 sm:mb-4">General Objective</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg text-justify">
                    To uphold the highest standards of academic records management and administrative support at San Pablo Colleges, ensuring integrity, efficiency, and stakeholder satisfaction.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-green-700 mb-3 sm:mb-4">Specific Objectives</h4>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed pl-2 sm:pl-4">
                    <li className="mb-2 sm:mb-1">Maintain accurate, secure, and up-to-date academic records for all students and alumni.</li>
                    <li className="mb-2 sm:mb-1">Provide efficient and timely processing of document requests and administrative services.</li>
                    <li className="mb-2 sm:mb-1">Ensure compliance with institutional policies, legal requirements, and data privacy standards.</li>
                    <li className="mb-2 sm:mb-1">Support the educational goals of San Pablo Colleges through transparent and reliable records management.</li>
                    <li className="mb-2 sm:mb-1">Foster continuous improvement in service delivery to enhance stakeholder satisfaction.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizational Chart Section */}
        <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
                ORGANIZATIONAL CHART
              </h2>
            </div>

            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              {/* Top Level - Registrar */}
              <div className="border border-green-700 bg-white shadow-sm rounded-lg px-3 sm:px-6 py-2 sm:py-3 font-semibold text-green-700 w-full max-w-4xl text-center text-sm sm:text-base">
                <span className="break-words">Registrar / LO / CHED Scholarship Coordinator and Foreign Student Focal Person</span>
              </div>

              {/* Middle Level - Three Main Sections */}
              <div className="flex flex-col xl:flex-row justify-center items-start gap-4 sm:gap-6 lg:gap-8 w-full">
                {/* Column 1 - Basic Education Records Section */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1 w-full">
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    <span className="break-words">Basic Education Records Section</span>
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Supervising Records Officer
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Records Officers
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Student Assistants
                  </div>
                </div>

                {/* Column 2 - College, Law & Graduate School Records Section */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1 w-full">
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    <span className="break-words">College, Law & Graduate School Records Section</span>
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Supervising Records Officer
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Assistant Supervising Records Officer
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Records Officers
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Student Assistants
                  </div>
                </div>

                {/* Column 3 - Internal and External Help Desk */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1 w-full">
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    <span className="break-words">Internal and External Help Desk</span>
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    <span className="break-words">Admission Officer, Records Custodian, Scholarships & Foreign Student Coordinators</span>
                  </div>
                  <div className="border border-green-700 bg-white text-green-800 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm w-full text-center text-xs sm:text-sm">
                    Student Assistant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Hero;
