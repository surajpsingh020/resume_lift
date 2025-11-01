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
  "Job Title: {jobTitle} ; Keywords: {keywords} ; Generate exactly 3 professional summaries for different experience levels (Fresher, Mid-Level, Senior) in 3-4 lines each. Return ONLY a valid JSON array with no additional text or explanation. Each object must have exactly these fields: summary (string) and experience_level (string). Format: [{\"summary\":\"...\",\"experience_level\":\"Fresher\"},{\"summary\":\"...\",\"experience_level\":\"Mid-Level\"},{\"summary\":\"...\",\"experience_level\":\"Senior\"}]";

function Summary({ resumeInfo, enabledNext, enabledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [summary, setSummaryState] = useState(resumeInfo?.summary || "");
  const [aiGeneratedSummaryList, setAiGenerateSummaryList] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const { resume_id } = useParams();

  const handleInputChange = (e) => {
    enabledNext(false);
    enabledPrev(false);
    const newValue = e.target.value;
    
    dispatch(
      addResumeData({
        ...resumeInfo,
        [e.target.name]: newValue,
      })
    );
    setSummaryState(newValue);
    
    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      autoSave(newValue);
    }, 2000);
    
    setAutoSaveTimeout(timeout);
  };

  const autoSave = async (summaryText) => {
    if (!resume_id) return;
    
    try {
      const { updateThisResume } = await import("@/Services/resumeAPI");
      await updateThisResume(resume_id, {
        data: { summary: summaryText },
      });
      toast.success("Auto-saved", { duration: 1000 });
    } catch (error) {
      // Silent fail for auto-save
    }
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
      
      // Gather context from the entire resume for more personalized suggestions
      const jobTitle = resumeInfo?.jobTitle || "";
      
      // Extract skills
      const skills = resumeInfo?.skill?.map(s => s.name).filter(Boolean).join(", ") || "";
      
      // Extract education
      const education = resumeInfo?.education?.map(e => 
        `${e.degree || ''} in ${e.major || ''} from ${e.universityName || ''}`
      ).filter(e => e.trim() !== ' in  from ').join("; ") || "";
      
      // Extract experience titles for context
      const experienceTitles = resumeInfo?.experience?.map(e => e.title).filter(Boolean).join(", ") || "";
      
      // Build enriched context
      let contextString = `Job Title: ${jobTitle}`;
      if (skills) contextString += ` | Skills: ${skills}`;
      if (education) contextString += ` | Education: ${education}`;
      if (experienceTitles) contextString += ` | Previous Roles: ${experienceTitles}`;
      
      const PROMPT = `Based on the following profile information:\n${contextString}\n\nGenerate exactly 3 professional summaries for different experience levels (Fresher, Mid-Level, Senior) in 3-4 lines each. Make them specific to the skills and background provided. Return ONLY a valid JSON array with no additional text or explanation. Each object must have exactly these fields: summary (string) and experience_level (string). Format: [{"summary":"...","experience_level":"Fresher"},{"summary":"...","experience_level":"Mid-Level"},{"summary":"...","experience_level":"Senior"}]`;
      
      console.log("AI Prompt with context:", PROMPT);

      try {
        const result = await AIChatSession.sendMessage(PROMPT);
        let modelText = result.response.text();
        
        // Clean up the response: remove markdown code blocks if present
        modelText = modelText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to extract JSON array if it's embedded in text
        const jsonMatch = modelText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          modelText = jsonMatch[0];
        }
        
        console.log('Raw AI response:', modelText);
        
        // Attempt to parse the model text into a JS value and normalize to an array
        let parsed = null;
        try {
          parsed = JSON.parse(modelText);
        } catch (e) {
          console.warn('JSON parse failed, trying response.json() helper:', e);
          // If parsing fails, try response.json() helper (added in AiModel)
          parsed = result.response.json ? result.response.json() : null;
        }

        // Normalize to an array of suggestion objects
        if (!Array.isArray(parsed)) {
          if (parsed && typeof parsed === 'object') {
            // If it's an object with keys, try to find an array value
            const arr = Object.values(parsed).find(v => Array.isArray(v));
            parsed = arr || [parsed];
          } else if (typeof parsed === 'string' && parsed.trim()) {
            parsed = [{ summary: parsed, experience_level: 'Generated' }];
          } else {
            console.error('Could not parse AI response into array:', parsed);
            toast("AI returned unexpected format. Please try again.", "error");
            setLoading(false);
            return;
          }
        }

        console.log('Parsed suggestions:', parsed);
        setAiGenerateSummaryList(parsed);
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
