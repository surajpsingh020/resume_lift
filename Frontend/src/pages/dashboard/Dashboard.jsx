import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllResumeData } from "@/Services/resumeAPI";
import AddResume from "./components/AddResume";
import ResumeCard from "./components/ResumeCard";
import UserProfile from "./components/UserProfile";

function Dashboard() {
  const user = useSelector((state) => state.editUser.userData);
  const [resumeList, setResumeList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAllResumeData = async () => {
    try {
      setLoading(true);
      const resumes = await getAllResumeData();
      setResumeList(resumes.data);
    } catch (error) {
      console.error("Failed to fetch resumes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResumeData();
  }, [user]);

  return (
    <div className="p-10 md:px-20 lg:px-32">
      {/* Header with Profile */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-bold text-3xl">My Resume</h2>
          <p className="py-3"> Start creating your AI Resume for your next job role</p>
        </div>
        <UserProfile />
      </div>
      
      {/* Resume Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 mt-5 gap-4">
        <AddResume />
        {loading ? (
          // Skeleton loaders
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-64 bg-gray-100 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </>
        ) : resumeList.length > 0 ? (
          resumeList.map((resume, index) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              refreshData={fetchAllResumeData}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg">No resumes yet. Create your first resume to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
