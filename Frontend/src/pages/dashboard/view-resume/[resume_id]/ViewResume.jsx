import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getResumeData } from "@/Services/resumeAPI";
import ResumePreview from "../../edit-resume/components/PreviewPage";
import { useDispatch, useSelector } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { RWebShare } from "react-web-share";
import { toast } from "sonner";
import { exportResumeToWord } from "@/lib/exportToWord";
import { FileText } from "lucide-react";

function ViewResume() {
  const [resumeInfo, setResumeInfo] = React.useState({});
  const { resume_id } = useParams();
  const dispatch = useDispatch();
  const resumeData = useSelector((state) => state.editResume.resumeData);

  useEffect(() => {
    fetchResumeInfo();
  }, []);
  const fetchResumeInfo = async () => {
    const response = await getResumeData(resume_id);
    // console.log(response.data);
    dispatch(addResumeData(response.data));
  };

  const HandleDownload = () => {
    // Add styles to hide browser print headers/footers
    const style = document.createElement('style');
    style.textContent = `
      @page { 
        margin: 0; 
        size: A4;
      }
      @media print {
        body { margin: 0; }
        html, body { height: 100%; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const HandleExportToWord = async () => {
    try {
      await exportResumeToWord(resumeData);
      toast.success("Resume exported to Word successfully!");
    } catch (error) {
      toast.error("Failed to export resume to Word");
      console.error(error);
    }
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div id="noPrint">
          <div className="my-10 mx-10 md:mx-20 lg:mx-36">
            <h2 className="text-center text-2xl font-medium">
              Congrats! Your Ultimate AI generated Resume is ready !{" "}
            </h2>
            <p className="text-center text-gray-400">
              Now you can download your resume and share your unique resume URL with your friends and family.{" "}
            </p>
            <div className="flex justify-center gap-4 px-44 my-10">
              <Button onClick={HandleDownload}>Download PDF</Button>
              <Button onClick={HandleExportToWord} variant="outline" className="gap-2">
                <FileText size={18} />
                Export to Word
              </Button>
              <RWebShare
                data={{
                  text: "Hello This is My resume",
                  url: import.meta.env.VITE_BASE_URL + "/dashboard/view-resume/" + resume_id,
                  title: "Flamingos",
                }}
                onClick={() => toast("Resume Shared Successfully")}
              >
                <Button>Share</Button>
              </RWebShare>
            </div>
          </div>
        </div>
        <div
          className="bg-white rounded-lg shadow-lg print-area"
          style={{ 
            width: "210mm", 
            minHeight: "297mm", 
            padding: "1.5cm",
            boxSizing: "border-box"
          }}
        >
          <div className="print">
            <ResumePreview />
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewResume;
