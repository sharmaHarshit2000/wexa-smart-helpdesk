import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast, { Toaster } from 'react-hot-toast';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = user.role === 'user' ? '/tickets?myTickets=true' : '/tickets';
      const response = await apiClient.get(url);
      setTickets(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-12 w-12 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          My Support Tickets
        </h1>
        <Link
          to="/tickets/new"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors"
        >
          Create New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-4">Create your first support ticket to get started!</p>
          <Link
            to="/tickets/new"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Create First Ticket
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {ticket.title}
                    </Link>
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'waiting_human'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ticket.status === 'open'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{ticket.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>📁</span>
                    <span className="capitalize">{ticket.category}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>👤</span>
                    <span>{ticket.createdBy?.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>🕒</span>
                    <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium"
                >
                  View Details
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
