import { useState, useEffect } from 'react';
import { useAuth } from "../Api/AuthContext";
import { applyVotingContest, getVotingContestStatus } from "../Api/api";

const dummyTrend = [
  { name: 'Naveen', votes: 12 },
  { name: 'Naveen2', votes: 8 },
  { name: 'Naveen3', votes: 5 },
];
const dummyWinners = [
  { name: 'Naveen', votes: 12 },
  { name: 'Naveen2', votes: 8 },
  { name: 'Naveen3', votes: 5 },
];

export default function VotingApplyPage() {
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [votingStartTime, setVotingStartTime] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [votingStatus, setVotingStatus] = useState(null);

  useEffect(() => {
    let timer;
    if (votingStartTime) {
      const updateCountdown = () => {
        const now = new Date();
        const start = new Date(votingStartTime);
        const diff = start - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown("Voting has started!");
        }
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }
    return () => clearInterval(timer);
  }, [votingStartTime]);

  useEffect(() => {
  //Check if user is authenticated and fetch voting status
    const fetchStatus = async () => {
      try {
        const res = await getVotingContestStatus();
        setVotingStatus(res.data);
        // Optionally, check if user has applied (if backend provides this info)
        // For now, use local applied state
      } catch {}
    };
    fetchStatus();
  }, [user]);

  // If user has already applied, show thank you and timing in side div
  useEffect(() => {
    if (applied) setHasApplied(true);
  }, [applied]);

  const handleSubmit =  async (event) => {
    event.preventDefault();
    try{
    
      const imageUrl = user?.profilePicUrl || "";
      console.log("Submitting application for user:", user.id, "with email:", email, "and image URL:", imageUrl);
      await applyVotingContest(user.id, email, imageUrl);
      setApplied(true);
    
      
      const res = await getVotingContestStatus();
      setVotingStartTime(res.data.votingStartTime);
    }catch(err){
      console.error("Error submitting application:",err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-5">
      <div className="w-full max-w-5xl translucent-bg rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Application Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-[#32a86d] mb-6 text-center">Apply for Voting Contest</h2>
          {hasApplied ? (
            <div className="text-green-600 text-center text-lg font-semibold">
              Thank you for applying! Good luck!<br/>
              {votingStatus?.votingStartTime && (
                <>
                  <div className="mt-4 text-gray-700 font-normal">
                    Voting starts at: <b>{new Date(votingStatus.votingStartTime).toLocaleString()}</b>
                  </div>
                  <div className="mt-2 text-blue-700 font-bold text-xl">
                    {/* Countdown timer logic can be reused here if needed */}
                  </div>
                  <div className="mt-4 text-gray-600 text-base">
                    Results show on <b>Friday night</b>.<br/>
                    Applications open <b>Saturday and Sunday</b>.<br/>
                    Voting lasts <b>5 days</b>.
                  </div>
                  <div className="mt-4 text-gray-800 text-base font-bold">
                    Total contenders: {votingStatus?.totalApplications ?? '...'}
                  </div>
                </>
              )}
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="font-semibold">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="border rounded px-3 py-2" />
              <label className="font-semibold">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="border rounded px-3 py-2" />

              <label className="font-semibold">Image(Optional)</label>
              <input type="file" accept="image/*"  className="border rounded px-3 py-2 " onChange={e => {
                const file = e.target.files[0];
                if(file) setImageFile(file);
              }} />

              <button type="submit" className="mt-4 bg-[#32a86d] text-white px-6 py-2 rounded-full font-bold text-base shadow hover:bg-[#2c915d] transition">Submit Application</button>
            </form>
          )}
        </div>
        {/* Right: Contest Details, Voting Graph, Winners */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[#f6fff0] border-l border-[#d2f5c4]">
          <h3 className="text-xl font-bold text-[#32a86d] mb-2">Contest Details</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Submit your application to participate.</li>
            <li>Voting will be open for 2 days after applications close.</li>
            <li>Top 3 contestants will be featured on the dashboard.</li>
            <li>Live voting trend will be shown during voting without name and then after time completion automatically show the winner contenders.</li>
            <li>Winners will be announced here after voting ends and they show on the public dashboard till next voting start.</li>
            <li>Only Authorized application will be accepted.So make sure your application details must match with your data.</li>
            <li>You can add a image for showing during voting trend.</li>
          </ul>
          <div className="mb-6">
            <h4 className="font-bold text-[#32a86d] mb-2">Live Voting Trend</h4>
            {/* Dummy bar graph */}
            <div className="flex gap-2 items-end h-32">
              {dummyTrend.map((c, i) => (
                <div key={c.name} className="flex flex-col items-center">
                  <div className="bg-[#32a86d] w-8 rounded-t-lg" style={{ height: `${c.votes * 8}px` }}></div>
                  <div className="text-xs mt-1 font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.votes} votes</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#32a86d] mb-2">Winners (Top 3)</h4>
            <ol className="list-decimal pl-6">
              {dummyWinners.map((w, i) => (
                <li key={w.name} className="mb-1 font-semibold text-gray-700">{i + 1}. {w.name} <span className="text-[#32a86d]">({w.votes} votes)</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 