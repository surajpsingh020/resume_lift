import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import PersonalDetails from "./form-components/PersonalDetails";
import Summary from "./form-components/Summary";
import Experience from "./form-components/Experience";
import Education from "./form-components/Education";
import Skills from "./form-components/Skills";
import Project from "./form-components/Project";
import { ArrowLeft, ArrowRight, HomeIcon, Eye } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ThemeColor from "./ThemeColor";
import PreviewPage from "./PreviewPage";

function ResumeForm({ setShowSidePreview }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enabledNext, setEnabledNext] = useState(true);
  const [enabledPrev, setEnabledPrev] = useState(true);
  const resumeInfo = useSelector((state) => state.editResume.resumeData);
  const navigate = useNavigate();
  const { resume_id } = useParams();

  useEffect(() => {
    if (currentIndex === 0) {
      setEnabledPrev(false);
    } else if (currentIndex == 1) {
      setEnabledPrev(true);
    } else if (currentIndex === 5) {
      setEnabledNext(true);
    } else if (currentIndex === 6) {
      setEnabledNext(false);
    }

    // Hide side preview when on preview tab (index 6), show otherwise
    if (setShowSidePreview) {
      setShowSidePreview(currentIndex !== 6);
    }
  }, [currentIndex, setShowSidePreview]);

  // Add keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Right Arrow: Next
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight' && enabledNext && currentIndex < 6) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      }
      // Ctrl/Cmd + Left Arrow: Previous
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft' && enabledPrev && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, enabledNext, enabledPrev]);

  // To Add Dummy Data
  // useEffect(() => {
  //   dispatch(addResumeData(data));
  // }, []);

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Link to="/dashboard">
            <Button>
              <HomeIcon />
            </Button>
          </Link>
          <ThemeColor resumeInfo={resumeInfo}/> 
        </div>
        <div className="flex items-center gap-3">
          {currentIndex > 0 && (
            <Button
              size="sm"
              className="text-sm gap-2"
              disabled={!enabledPrev}
              onClick={() => {
                if (currentIndex === 0) return;
                setCurrentIndex(currentIndex - 1);
              }}
            >
              <ArrowLeft /> Prev
            </Button>
          )}
          {currentIndex < 6 && (
            <Button
              size="sm"
              className="gap-2"
              disabled={!enabledNext}
              onClick={() => {
                if (currentIndex >= 6) return;
                setCurrentIndex(currentIndex + 1);
              }}
            >
              Next <ArrowRight className="text-sm" />
            </Button>
          )}
          {currentIndex === 6 && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => navigate(`/dashboard/view-resume/${resume_id}`)}
            >
              <Eye className="text-sm" /> View Full Page
            </Button>
          )}
        </div>
      </div>
      {currentIndex === 0 && (
        <PersonalDetails
          resumeInfo={resumeInfo}
          enabledNext={setEnabledNext}
        />
      )}
      {currentIndex === 1 && (
        <Summary
          resumeInfo={resumeInfo}
          enabledNext={setEnabledNext}
          enabledPrev={setEnabledPrev}
        />
      )}
      {currentIndex === 2 && (
        <Experience
          resumeInfo={resumeInfo}
          enabledNext={setEnabledNext}
          enabledPrev={setEnabledPrev}
        />
      )}
      {currentIndex === 3 && (
        <Project
          resumeInfo={resumeInfo}
          setEnabledNext={setEnabledNext}
          setEnabledPrev={setEnabledPrev}
        />
      )}
      {currentIndex === 4 && (
        <Education
          resumeInfo={resumeInfo}
          enabledNext={setEnabledNext}
          enabledPrev={setEnabledPrev}
        />
      )}
      {currentIndex === 5 && (
        <Skills
          resumeInfo={resumeInfo}
          enabledNext={setEnabledNext}
          enabledPrev={setEnabledPrev}
        />
      )}
      {currentIndex === 6 && (
        <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg">Resume Preview</h2>
              <p>Review your complete resume before finalizing</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/view-resume/${resume_id}`)}
              className="gap-2"
            >
              <Eye /> Open Full Screen
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            <PreviewPage />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeForm;
