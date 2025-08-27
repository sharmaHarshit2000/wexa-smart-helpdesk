import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import toast, { Toaster } from 'react-hot-toast';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    setLoading(true);
    try {
      const ticketRes = await apiClient.get(`/tickets/${id}`);
      setTicket(ticketRes.data);

      if (user.role === 'user' && ticketRes.data.createdBy._id !== user.id) {
        toast.error('Access denied. You can only view your own tickets.');
        setLoading(false);
        return;
      }

      const auditRes = await apiClient.get(`/tickets/${id}/audit`);
      setAuditLogs(auditRes.data);

      if (['agent', 'admin'].includes(user.role)) {
        try {
          const suggestionRes = await apiClient.get(`/agent/suggestion/${id}`);
          setSuggestion(suggestionRes.data);
        } catch {
          console.log('No agent suggestion available');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch ticket data');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
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

  if (!ticket)
    return <div className="text-center p-4 text-gray-600">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Ticket Details
        </h1>
        <Link
          to="/tickets"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Back to Tickets
        </Link>
      </div>

      {/* Ticket Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 break-words">
          {ticket.title}
        </h2>
        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{ticket.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${
                ticket.status === 'resolved'
                  ? 'bg-green-100 text-green-800'
                  : ticket.status === 'waiting_human'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <span className="ml-2 text-gray-600">{ticket.category}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-600">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">By:</span>
            <span className="ml-2 text-gray-600">{ticket.createdBy?.name}</span>
          </div>
        </div>
      </div>

      {/* AI Suggestion */}
      {suggestion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            AI Agent Suggestion
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-yellow-700">Predicted Category:</span>
              <span className="ml-2 text-yellow-600">{suggestion.predictedCategory}</span>
            </div>
            <div>
              <span className="font-medium text-yellow-700">Confidence:</span>
              <span className="ml-2 text-yellow-600">
                {(suggestion.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="font-medium text-yellow-700">Auto-closed:</span>
              <span className="ml-2 text-yellow-600">{suggestion.autoClosed ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="bg-white border border-yellow-300 rounded p-4 mb-4">
            <h4 className="font-medium text-yellow-700 mb-2">Drafted Reply:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{suggestion.draftReply}</p>
          </div>

          {ticket.status === 'waiting_human' && (
            <AgentReviewInterface
              ticketId={id}
              suggestion={suggestion}
              onReplySent={fetchTicketData}
            />
          )}

          {ticket.status === 'resolved' && suggestion.autoClosed && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
              <h4 className="font-medium text-green-700 mb-2">
                AI Response (Auto-resolved):
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{suggestion.draftReply}</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Audit Timeline</h3>
        <div className="space-y-4">
          {auditLogs.map((log, index) => (
            <div key={log._id} className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 flex flex-col items-center sm:mr-4 mb-2 sm:mb-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {index < auditLogs.length - 1 && <div className="w-0.5 bg-gray-300 h-8 mt-1"></div>}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700 capitalize">{log.actor}</span>
                  <span className="mx-2 hidden sm:inline">•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-800 font-semibold mb-1">{log.action.replace(/_/g, ' ')}</p>
                {log.meta && Object.keys(log.meta).length > 0 && (
                  <div className="bg-gray-50 rounded p-3 mt-2 overflow-x-auto">
                    <pre className="text-xs text-gray-600">{JSON.stringify(log.meta, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AgentReviewInterface = ({ ticketId, suggestion, onReplySent }) => {
  const [reply, setReply] = useState(suggestion.draftReply);
  const [loading, setLoading] = useState(false);

  const handleSendReply = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/tickets/${ticketId}/reply`, { reply });
      toast.success('Reply sent successfully!');
      onReplySent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4 mt-4">
      <h4 className="font-medium text-gray-700 mb-3">Agent Review & Response</h4>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows="6"
        className="w-full border border-gray-300 rounded p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Edit the response..."
      />
      <button
        onClick={handleSendReply}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reply to Customer'}
      </button>
    </div>
  );
};

export default TicketDetail;
