import React, { useEffect } from "react";
import ResumeForm from "../components/ResumeForm";
import PreviewPage from "../components/PreviewPage";
import { useParams } from "react-router-dom";
import { getResumeData } from "@/Services/resumeAPI";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";

export function EditResume() {
  const { resume_id } = useParams();
  const dispatch = useDispatch();
  const [showSidePreview, setShowSidePreview] = React.useState(true);

  useEffect(() => {
    getResumeData(resume_id).then((data) => {
      dispatch(addResumeData(data.data));
    });
  }, [resume_id]);
  
  return (
    <div className={`grid ${showSidePreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} p-10 gap-10`}>
      <ResumeForm setShowSidePreview={setShowSidePreview} />
      {showSidePreview && <PreviewPage />}
    </div>
  );
}

export default EditResume;
