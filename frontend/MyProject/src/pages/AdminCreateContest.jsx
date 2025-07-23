import React, { useState,useEffect } from "react";
import api from "../Api/api.jsx";
import { useAuth } from "../Api/AuthContext";

export default function AdminCreateContest() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("voting");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [endTimeError, setEndTimeError] = useState("");
  const [startTimeError, setStartTimeError] = useState("");
  const [listContest , setListContest] = useState(false);
  const [currentContest, setCurrentContest] = useState([]);

  //Remove Contest
  const RemoveContest = async ()=> {
    try {
    await api.delete(`/voting-contest/remove-contest/${currentContest.id}`);
    setMessage("Contest removed successfully!");
  
    }catch(err){
      alert("Error in removing contest:" + err.message);
      setMessage("Failed to remove contest.");
    }
  }

  //Fetch existing contests
  // useEffect(()=>{
  //   fetchExistingContests();
  // })
  const fetchExistingContests = async()=>{
    try {
      const res = await api.get("/voting-contest/get-all-contests");
      setCurrentContest(res.data);
      setListContest(true);
    } catch (err) {
      console.error("Error fetching contests:", err);
      setMessage("Failed to fetch existing contests.");
    }
  }

  // Helper to validate datetime-local string
  function isValidDateTime(val) {
    // Matches YYYY-MM-DDTHH:MM
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStartTimeError("");
    setEndTimeError("");
    // Custom validation for start and end time
    if (!isValidDateTime(startTime)) {
      setStartTimeError("Please enter a valid date and time.");
      setLoading(false);
      return;
    }
    if (!isValidDateTime(endTime)) {
      setEndTimeError("Please enter a valid date and time.");
      setLoading(false);
      return;
    }
    // Parse for comparison
    const startDate = new Date(startTime.replace('T', ' ') + ':00');
    const endDate = new Date(endTime.replace('T', ' ') + ':00');
    if (isNaN(startDate.getTime())) {
      setStartTimeError("Please enter a valid date and time.");
      setLoading(false);
      return;
    }
    if (isNaN(endDate.getTime())) {
      setEndTimeError("Please enter a valid date and time.");
      setLoading(false);
      return;
    }
    if (endDate <= startDate) {
      setEndTimeError("End time must be after start time.");
      setLoading(false);
      return;
    }
    try {
      await api.post("/voting-contest/create-contest", {
        title,
        description,
        startTime,
        endTime,
      });
      setMessage("Contest created successfully!");
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setMessage(
        "Error creating contest: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Only allow admins to use this page (route protection is in App.jsx)
  if (!user || !(user.role === "ADMIN" || user.roles?.includes("ROLE_ADMIN") || user.roles?.some?.(r => r === "ROLE_ADMIN" || r.name === "ROLE_ADMIN"))) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* Tabs for contest types */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors ${activeTab === "voting" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}
          onClick={() => setActiveTab("voting")}
        >
          Voting Contest
        </button>
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors ${activeTab === "quiz" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}
          onClick={() => setActiveTab("quiz")}
        >
          Quiz Contest
        </button>
        <button
          className={`px-6 py-2 font-semibold border-b-2 transition-colors ${activeTab === "other" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}
          onClick={() => setActiveTab("other")}
        >
          {/* Placeholder for future contest type */}
        </button>
      </div>

      {/* Voting Contest Form */}
      {activeTab === "voting" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Description</label>
            <input
              className="w-full border p-2 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Enter time of event</label>
            <input
              type="datetime-local"
              className={`w-full border p-2 rounded ${startTimeError ? 'border-red-500' : ''}`}
              value={startTime}
              onChange={e => {
                let val = e.target.value;
                // If only date is picked, append T00:00
                if (val && val.length === 10) val += 'T00:00';
                setStartTime(val);
                if (val.length >= 16) setStartTimeError("");
              }}
            />
            {startTimeError && <div className="text-red-600 text-sm mt-1">{startTimeError}</div>}
          </div>
          <div>
            <label className="block font-medium">Enter data and time</label>
            <input
              type="datetime-local"
              className={`w-full border p-2 rounded ${endTimeError ? 'border-red-500' : ''}`}
              value={endTime}
              onChange={e => {
                let val = e.target.value;
                if (val && val.length === 10) val += 'T00:00';
                setEndTime(val);
                if (val.length >= 16) setEndTimeError("");
              }}
            />
            {endTimeError && <div className="text-red-600 text-sm mt-1">{endTimeError}</div>}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Contest"}
          </button>
        </form>

        
      )}
      

      <div className="mt-6 text-center">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setListContest(prev => !prev)} onChange={fetchExistingContests} >
          Show all Existing-Contest
        </button>
      </div>
    

      {/* Quiz Contest Tab (UI only for now) */}
      {activeTab === "quiz" && (
        <div className="text-gray-500 text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Quiz Contest (Coming Soon)</h3>
          <p>UI for quiz contest creation will be added here.</p>
        </div>
      )}

      {/* Other Tab (empty placeholder) */}
      {activeTab === "other" && (
        <div className="text-gray-400 text-center py-8">(Empty)</div>
      )}
      
      {message && <div className="mt-4 text-center text-lg">{message}</div>}

      {listContest && (
        <div className="mt-8 p-2 bg-gray-50 rounded shadow">
          <h3 className="font-bold text-center">List of Existing Contest</h3>
          <ul className="mt-2 space-y-2">

          
            {/* console.log(currentContest); */}
            {Array.isArray(currentContest) && currentContest.map((contest)=>(
              <li key={contest.id} className="p-4 bg-white rounded shadow hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold">{contest.title}</h4>
                <p className="text-gray-600">{contest.description}</p>
                <p className="text-sm text-gray-500">Start: {new Date(contest.startTime).toLocaleString()}</p>
                <p className="text-sm text-gray-500">End: {new Date(contest.endTime).toLocaleString()}</p>
              </li>
            ))}
          <button className="h-5 w-5 bg-red-200" onClick={RemoveContest}>End of this Contest</button>
          </ul>
        </div>
      )}
    </div>
  );
} 