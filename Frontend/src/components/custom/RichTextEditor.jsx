import React, { useState } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { AIChatSession } from "@/Services/AiModel";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Sparkles, LoaderCircle } from "lucide-react";

function RichTextEditor({ onRichTextEditorChange, index, resumeInfo }) {
  const [value, setValue] = useState(
    resumeInfo?.experience[index]?.workSummary || ""
  );
  const [loading, setLoading] = useState(false);

  const GenerateSummaryFromAI = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast("Please Add Position Title");
      return;
    }
    setLoading(true);

    try {
      const positionTitle = resumeInfo.experience[index].title;
      const companyName = resumeInfo.experience[index].companyName || "";
      
      console.log("=== AI Generation Debug Info ===");
      console.log("Resume Info:", resumeInfo);
      console.log("Professional Summary:", resumeInfo?.summary);
      console.log("Current Work Summary Input:", value);
      
      // Gather skills for context
      const skills = resumeInfo?.skills?.map(s => s.name).filter(Boolean).join(", ") || 
                     resumeInfo?.skill?.map(s => s.name).filter(Boolean).join(", ") || "";
      console.log("Skills found:", skills);
      
      // Extract keywords from professional summary section
      let professionalSummaryKeywords = "";
      if (resumeInfo?.summary) {
        const summaryText = resumeInfo.summary.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
        console.log("Professional summary text (cleaned):", summaryText);
        
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'am', 'that', 'this', 'their', 'them', 'they'];
        const words = summaryText.toLowerCase()
          .split(/\s+/)
          .map(word => word.replace(/[^a-z0-9]/g, ''))
          .filter(word => word.length > 3 && !commonWords.includes(word))
          .slice(0, 15);
        professionalSummaryKeywords = [...new Set(words)].join(", ");
        console.log("Extracted keywords from professional summary:", professionalSummaryKeywords);
      }
      
      // Extract keywords from current work summary input field
      let workSummaryKeywords = "";
      if (value && value.trim()) {
        const workText = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
        console.log("Work summary input (cleaned):", workText);
        
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'am', 'that', 'this', 'their', 'them', 'they', 'using', 'used', 'worked', 'work', 'implemented'];
        const words = workText.toLowerCase()
          .split(/\s+/)
          .map(word => word.replace(/[^a-z0-9]/g, ''))
          .filter(word => word.length > 3 && !commonWords.includes(word))
          .slice(0, 20);
        workSummaryKeywords = [...new Set(words)].join(", ");
        console.log("Extracted keywords from work summary input:", workSummaryKeywords);
      }
      
      // Combine all keywords
      const allKeywords = [professionalSummaryKeywords, workSummaryKeywords]
        .filter(Boolean)
        .join(", ");
      console.log("Combined keywords for AI:", allKeywords);
      
      // Build context-aware prompt
      let contextPrompt = `Generate 3-4 concise bullet points describing relevant work experience, responsibilities, and achievements for the position: "${positionTitle}"`;
      if (companyName) contextPrompt += ` at ${companyName}`;
      
      // Add keywords context
      if (workSummaryKeywords) {
        contextPrompt += `.\n\nBased on the user's input, focus on these key areas and technologies: ${workSummaryKeywords}`;
      }
      if (professionalSummaryKeywords) {
        contextPrompt += `.\n\nAdditional context from professional summary: ${professionalSummaryKeywords}`;
      }
      if (skills) {
        contextPrompt += `.\n\nRelevant technical skills to highlight: ${skills}`;
      }
      
      contextPrompt += `.\n\nReturn ONLY a valid JSON object with no additional text or explanation. The object must have this exact structure: {"experience":["<li>bullet point 1</li>","<li>bullet point 2</li>",...]}. Each bullet point must be wrapped in <li> HTML tags and should be SHORT (1-2 lines max), specific, action-oriented, and quantifiable where possible. Keep it concise and impactful. Focus on key achievements and responsibilities only. Format: {"experience":["<li>...</li>","<li>...</li>","<li>...</li>"]}`;
      
      console.log("AI Prompt with context:", contextPrompt);
      const result = await AIChatSession.sendMessage(contextPrompt);
      let modelText = result.response.text();
      
      // Clean up the response: remove markdown code blocks if present
      modelText = modelText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON object if it's embedded in text
      const jsonMatch = modelText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        modelText = jsonMatch[0];
      }
      
      console.log('Raw AI response:', modelText);
      
      let resp;
      try {
        resp = JSON.parse(modelText);
      } catch (e) {
        console.warn('JSON parse failed:', e);
        resp = result.response.json ? result.response.json() : null;
      }
      
      if (!resp) {
        toast("AI returned invalid format. Please try again.", "error");
        setLoading(false);
        return;
      }
      
      console.log('Parsed experience:', resp);
      
      // Set the value with the experience bullets
      const experienceHtml = resp.experience
        ? resp.experience.join("")
        : resp.experience_bullets
        ? resp.experience_bullets.join("")
        : "";
      
      if (experienceHtml) {
        setValue(experienceHtml);
        onRichTextEditorChange(experienceHtml);
        toast("Experience generated successfully!", "success");
      } else {
        toast("No experience data returned. Please try again.", "error");
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summary</label>
        <Button
          variant="outline"
          size="sm"
          onClick={GenerateSummaryFromAI}
          disabled={loading}
          className="flex gap-2 border-primary text-primary"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate from AI
            </>
          )}
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('=== RichTextEditor onChange ===');
            console.log('Old value length:', value?.length || 0);
            console.log('New value length:', newValue?.length || 0);
            console.log('New value preview:', newValue?.substring(0, 100));
            setValue(newValue);
            onRichTextEditorChange(newValue);
          }}
          containerProps={{ style: { minHeight: '150px', resize: 'vertical' } }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}

export default RichTextEditor;
