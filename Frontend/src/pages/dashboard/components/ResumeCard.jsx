import { FaEye, FaEdit, FaTrashAlt, FaBook, FaSpinner } from "react-icons/fa";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PersonalDeatailPreview from "../edit-resume/components/preview-components/PersonalDeatailPreview";
import SummaryPreview from "../edit-resume/components/preview-components/SummaryPreview";
import ExperiencePreview from "../edit-resume/components/preview-components/ExperiencePreview";
import EducationalPreview from "../edit-resume/components/preview-components/EducationalPreview";
import SkillsPreview from "../edit-resume/components/preview-components/SkillsPreview";
import ProjectPreview from "../edit-resume/components/preview-components/ProjectPreview";

const gradients = [
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-green-400 via-blue-500 to-purple-600",
  "from-red-400 via-yellow-500 to-green-500",
  "from-blue-500 via-teal-400 to-green-300",
  "from-pink-500 via-red-500 to-yellow-500",
];

const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};

function ResumeCard({ resume, refreshData }) {
  const [loading, setLoading] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const gradient = getRandomGradient();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    console.log("Delete Resume with ID", resume._id);
    try {
      const response = await deleteThisResume(resume._id);
    } catch (error) {
      console.error("Error deleting resume:", error.message);
      toast(error.message);
    } finally {
      setLoading(false);
      setOpenAlert(false);
      refreshData();
    }
  };
  return (
    <div
      className={`bg-white rounded-lg flex flex-col shadow-lg transition duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] border border-gray-200`}
    >
      {/* Resume Title Header */}
      <div className={`p-4 bg-gradient-to-r ${gradient} rounded-t-lg`}>
        <h2 className="text-center font-bold text-lg text-white truncate">
          {resume.title}
        </h2>
      </div>

      {/* Resume Preview */}
      <div 
        className="relative bg-white overflow-hidden cursor-pointer"
        onClick={() => navigate(`/dashboard/view-resume/${resume._id}`)}
        style={{ height: '400px' }}
      >
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            transform: 'scale(0.35)',
            transformOrigin: 'top left',
            width: '285%',
            height: '285%'
          }}
        >
          <div
            className="shadow-lg h-full p-14 bg-white"
          >
            <PersonalDeatailPreview resumeInfo={resume} />
            <SummaryPreview resumeInfo={resume} />
            {resume?.experience && <ExperiencePreview resumeInfo={resume} />}
            {resume?.projects && <ProjectPreview resumeInfo={resume} />}
            {resume?.education && <EducationalPreview resumeInfo={resume} />}
            {resume?.skills && <SkillsPreview resumeInfo={resume} />}
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <FaEye className="text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around p-4 bg-gray-50 rounded-b-lg border-t">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/view-resume/${resume._id}`)}
          className="mx-1 hover:bg-indigo-100"
          title="View Resume"
        >
          <FaEye className="text-gray-600 hover:text-indigo-600 transition duration-300 ease-in-out" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/edit-resume/${resume._id}`)}
          className="mx-1 hover:bg-purple-100"
          title="Edit Resume"
        >
          <FaEdit className="text-gray-600 hover:text-purple-600 transition duration-300 ease-in-out" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setOpenAlert(true)}
          className="mx-1 hover:bg-red-100"
          title="Delete Resume"
        >
          <FaTrashAlt className="text-gray-600 hover:text-red-600 transition duration-300 ease-in-out" />
        </Button>
        <AlertDialog open={openAlert} onClose={() => setOpenAlert(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                Resume and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenAlert(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={loading}>
                {loading ? <FaSpinner className="animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default ResumeCard;
