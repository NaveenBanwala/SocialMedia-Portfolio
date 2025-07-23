import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Api/AuthContext";
import { getVotingContestStatus, applyVotingContest, getVotingTrend, voteForContestant, getVotingContestTop } from "../Api/api";
import api from "../Api/api";

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images/')) {
    return `http://localhost:8080/api/files${imagePath.substring(7)}`;
  }
  return `http://localhost:8080${imagePath}`;
}

function VotingContest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // { isVotingOpen, votingEndedAt }
  const [applied, setApplied] = useState(false);
  const [trend, setTrend] = useState([]); // List of contestants
  const [top, setTop] = useState([]); // Top 3
  const [myApplication, setMyApplication] = useState(null);
  const [error, setError] = useState("");
  const [dashboardImages, setDashboardImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await getVotingContestStatus();
        setStatus(res.data);
      } catch {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!status) return;
    // Fetch applications (trend) if voting open, or to check if user applied
    const fetchTrend = async () => {
      try {
        const res = await getVotingTrend();
        setTrend(res.data);
        // Check if user has applied
        const myApp = res.data.find(a => a.user.id === user.id);
        setMyApplication(myApp);
        setApplied(!!myApp);
      } catch {
        setTrend([]);
      }
    };
    fetchTrend();
    // Fetch top 3 if voting closed
    if (!status.isVotingOpen) {
      getVotingContestTop().then(res => setTop(res.data.topContestants || []));
    }
  }, [status, user.id]);

  useEffect(() => {
    // Fetch dashboard images
    const fetchDashboardImages = async () => {
      try {
        const res = await api.get('/dashboard-images');
        setDashboardImages(Array.isArray(res.data) ? res.data : []);
      } catch {
        setDashboardImages([]);
      }
    };
    fetchDashboardImages();
  }, []);

  // Carousel logic for dashboard images
  useEffect(() => {
    if (!dashboardImages || dashboardImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dashboardImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [dashboardImages]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dashboardImages.length) % dashboardImages.length);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dashboardImages.length);
  };

  const handleApply = async () => {
    setError("");
    try {
      // For demo, use profile image as imageUrl
      const imageUrl = user.profilePicUrl || "";
      await applyVotingContest(user.id, imageUrl);
      setApplied(true);
      window.location.reload();
    } catch (e) {
        setError("Failed to apply. You may have already applied.");
    }
  };

    const handleVote = async (applicationId) => {
    setError("");
    try {
        await voteForContestant(user.id, applicationId);
      // Refresh trend
      const res = await getVotingTrend();
      setTrend(res.data);
    } catch (e) {
      setError("Failed to vote. You may have already voted or voting is closed.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#E8FFD7] w-full py-10">

        <div className="w-full max-w-4xl translucent-bg rounded-lg shadow-md flex flex-col md:flex-row gap-0 md:gap-0 overflow-hidden">
        {/* Left: Dashboard image (small, carousel if multiple) */}
        <div className="w-full md:w-2/5 flex flex-col items-center justify-center bg-gray-50 p-6 relative">
            <div className="relative w-48 h-32 md:w-64 md:h-44 flex items-center justify-center bg-gray-100 rounded-lg shadow">
            {dashboardImages.length > 0 ? (
                <>
                <img
                    src={getImageUrl(dashboardImages[currentIndex].url)}
                    alt={`dashboard-${currentIndex}`}
                    className="w-full h-full object-cover rounded-lg"
                    style={{ maxHeight: '11rem', objectFit: 'cover' }}
                />
                {dashboardImages.length > 1 && (
                    <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-gray-900"
                        aria-label="Previous image"
                    >
                        &#8592;
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-gray-900"
                        aria-label="Next image"
                    >
                        &#8594;
                    </button>
                    </>
                )}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No dashboard image</div>
            )}
            </div>
        </div>
        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-gray-300 my-8"></div>
        {/* Right: Voting/apply UI */}
        <div className="w-full md:w-3/5 flex flex-col items-center justify-center p-6">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {/* 1. Apply phase */}
          {!status?.isVotingOpen && !status?.votingEndedAt && !applied && (
            <div className="flex flex-col items-center">
              <p className="mb-4">To participate, submit your application.</p>
              <button className="bg-[#32a86d] text-white px-6 py-2 rounded font-bold" onClick={handleApply}>
                Apply for Contest
              </button>
            </div>
          )}
          {/* Already applied */}
          {!status?.isVotingOpen && !status?.votingEndedAt && applied && (
            <div className="text-green-600 font-bold text-center mb-4">You have applied for the contest. Please wait for voting to start.</div>
          )}
          {/* 2. Voting phase */}
          {status?.isVotingOpen && (
            <div className="w-full">
              <h3 className="text-xl font-bold mb-4 text-center">Voting Trend</h3>
              <div className="flex flex-col gap-4">
                {trend.map((a, idx) => (
                  <div key={a.id} className="flex items-center gap-4 bg-[#F7F7F7] rounded p-4 shadow">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#32a86d]">
                      <img src={a.imageUrl} alt={a.user.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{a.user.username}</div>
                      <div className="text-gray-500 text-sm">Votes: {a.votes || 0}</div>
                    </div>
                    <button
                      className="bg-[#32a86d] text-white px-4 py-2 rounded font-bold disabled:bg-gray-400"
                      onClick={() => handleVote(a.id)}
                      disabled={a.user.id === user.id || a.votedByMe}
                    >
                      {a.user.id === user.id ? "(You)" : a.votedByMe ? "Voted" : "Vote"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 3. Results phase */}
          {!status?.isVotingOpen && status?.votingEndedAt && (
            <div className="w-full">
              <h3 className="text-xl font-bold mb-4 text-center">Voting Results (Top 3)</h3>
              <div className="flex flex-wrap justify-center gap-8">
                {top.map((c, idx) => (
                  <div key={c.id} className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#32a86d] mb-2">
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-gray-500">Votes: {c.votes}</div>
                    <div className="text-sm text-gray-400 mt-1">#{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default VotingContest;