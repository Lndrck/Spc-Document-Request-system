import React, { useState, useEffect } from "react";
import api from '../lib/api';
import { Megaphone, CalendarDays } from "lucide-react";

const PublicAnnouncements = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the published announcement
        const announcementResponse = await api.get('/announcements/public');

        setAnnouncement(announcementResponse.data.announcement || {
          title: "Office Schedule Update",
          content: "The Office of the University Registrar will be conducting the Year-End Strategic Planning on M-Date-Date-Year."
        });
      } catch (err) {
        console.error('Error fetching public data:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
              PUBLIC ANNOUNCEMENTS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white border border-green-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
              PUBLIC ANNOUNCEMENTS
            </h2>
          </div>
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-3 sm:pb-4 inline-block px-4">
            PUBLIC ANNOUNCEMENTS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Published Announcement Card */}
          <div className="bg-white border border-green-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-3">
                <Megaphone className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-700">Published Announcement</h3>
            </div>

            {announcement && Object.keys(announcement).length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-2">{announcement.title}</h4>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  {announcement.created_at && (
                    <p className="text-xs text-green-600 mt-3 italic">
                      Published on: {formatDate(announcement.created_at)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 italic">No announcement published yet.</p>
              </div>
            )}
          </div>

          {/* Published Transaction Days Card */}
          <div className="bg-white border border-green-200 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-3">
                <CalendarDays className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-700">Published Announcement</h3>
            </div>

            {announcement && Object.keys(announcement).length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-2">{announcement.title}</h4>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  {announcement.created_at && (
                    <p className="text-xs text-green-600 mt-3 italic">
                      Published on: {formatDate(announcement.created_at)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 italic">No announcement published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAnnouncements;