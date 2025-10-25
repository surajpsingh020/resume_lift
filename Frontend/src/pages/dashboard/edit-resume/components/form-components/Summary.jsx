import React, { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AIChatSession } from "@/Services/AiModel";
import { updateThisResume } from "@/Services/resumeAPI";

const promptTemplate =
  "Job Title: {jobTitle} ; Keywords: {keywords} ; Depending on the job title and the provided keywords, give me a list of summaries for 3 experience levels (Fresher, Mid Level, Senior) in 3-4 lines each. Return an array of objects with fields: summary and experience_level in JSON format.";
function Summary({ resumeInfo, enabledNext, enabledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false); // Declare the undeclared variable using useState
  const [summary, setSummaryState] = useState(resumeInfo?.summary || ""); // Declare the undeclared variable using useState
  const [aiGeneratedSummaryList, setAiGenerateSummaryList] = useState(null); // Declare the undeclared variable using useState
  const { resume_id } = useParams();

  const handleInputChange = (e) => {
    enabledNext(false);
    enabledPrev(false);
    dispatch(
      addResumeData({
        ...resumeInfo,
        [e.target.name]: e.target.value,
      })
    );
    setSummaryState(e.target.value);
  };

  const onSave = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Started Saving Summary");
    const data = {
      data: { summary },
    };
    if (resume_id) {
      updateThisResume(resume_id, data)
        .then((data) => {
          toast("Resume Updated", "success");
        })
        .catch((error) => {
          toast("Error updating resume", `${error.message}`);
        })
        .finally(() => {
          enabledNext(true);
          enabledPrev(true);
          setLoading(false);
        });
    }
  }; // Declare the undeclared variable using useState

  const applySummary = (newSummary) => {
    dispatch(
      addResumeData({
        ...resumeInfo,
        summary: newSummary,
      })
    );
    setSummaryState(newSummary);
  };

  const GenerateSummaryFromAI = async () => {
    setLoading(true);
    console.log("Generate Summary From AI for", resumeInfo?.jobTitle);
    if (!resumeInfo?.jobTitle) {
      toast("Please Add Job Title");
      setLoading(false);
      return;
    }
      // Use the current textarea content as keywords; fallback to existing resume summary
      const keywords = (summary && summary.trim()) || resumeInfo?.summary || "";
      const jobTitle = resumeInfo?.jobTitle || "";
      const PROMPT = promptTemplate
        .replace("{jobTitle}", jobTitle)
        .replace("{keywords}", keywords);
      if (!jobTitle && !keywords) {
        toast("Please add a Job Title or some keywords in the Summary box before generating.");
        setLoading(false);
        return;
      }

      try {
      const result = await AIChatSession.sendMessage(PROMPT);
      console.log(JSON.parse(result.response.text()));
      setAiGenerateSummaryList(JSON.parse(result.response.text()));
      toast("Summary Generated", "success");
    } catch (error) {
      console.log(error);
      const msg = error?.message || "AI generation failed";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Summary</h2>
        <p>Add Summary for your job title</p>

        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              variant="outline"
              onClick={() => GenerateSummaryFromAI()}
              type="button"
              size="sm"
              className="border-primary text-primary flex gap-2"
            >
              <Sparkles className="h-4 w-4" /> Generate from AI
            </Button>
          </div>
          <Textarea
            name="summary"
            className="mt-5"
            required
            value={summary ? summary : resumeInfo?.summary}
            onChange={handleInputChange}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummaryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummaryList?.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                enabledNext(false);
                enabledPrev(false);
                applySummary(item?.summary);
              }}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
