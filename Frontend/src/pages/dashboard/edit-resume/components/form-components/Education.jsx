import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, Brain } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { updateResumeData } from "@/Services/GlobalApi";
import { toast } from "sonner";
import { updateThisResume } from "@/Services/resumeAPI";
import { AIChatSession } from "@/Services/AiModel";

const formFields = {
  universityName: "",
  degree: "",
  major: "",
  grade: "",
  gradeType: "CGPA",
  startDate: "",
  endDate: "",
  description: "",
};
function Education({ resumeInfo, enabledNext }) {
  const [educationalList, setEducationalList] = React.useState(
    resumeInfo?.education || [{ ...formFields }]
  );
  const { resume_id } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState({});

  useEffect(() => {
    dispatch(addResumeData({ ...resumeInfo, education: educationalList }));
  }, [educationalList]);

  const AddNewEducation = () => {
    setEducationalList([...educationalList, { ...formFields }]);
  };

  const RemoveEducation = () => {
    setEducationalList((educationalList) => educationalList.slice(0, -1));
  };

  const onSave = () => {
    if (educationalList.length === 0) {
      return toast.error("Please add at least one education");
    }
    
    // Validate dates
    for (let i = 0; i < educationalList.length; i++) {
      const edu = educationalList[i];
      if (edu.startDate && edu.endDate) {
        const start = new Date(edu.startDate);
        const end = new Date(edu.endDate);
        if (start > end) {
          toast.error(`Education ${i + 1}: End date must be after start date`);
          return;
        }
      }
    }
    
    setLoading(true);
    const data = {
      data: {
        education: educationalList,
      },
    };
    if (resume_id) {
      console.log("Started Updating Education");
      updateThisResume(resume_id, data)
        .then((data) => {
          toast.success("Education saved successfully!");
        })
        .catch((error) => {
          toast.error(`Failed to save education: ${error.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...educationalList];
    const newListData = {
      ...list[index],
      [name]: value,
    };
    list[index] = newListData;
    setEducationalList(list);
    
    // Immediate Redux dispatch for real-time preview
    dispatch(addResumeData({ ...resumeInfo, education: list }));
  };

  const GenerateDescriptionFromAI = async (index) => {
    setAiLoading((prev) => ({ ...prev, [index]: true }));
    
    try {
      const currentEducation = educationalList[index];
      
      // Extract keywords from current description input
      const currentDescription = currentEducation?.description || "";
      const descriptionKeywords = currentDescription
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => 
          word.length > 3 && 
          ![
            "the", "and", "with", "using", "worked", "have", "been", "this",
            "that", "from", "were", "which", "their", "about", "would",
            "there", "could", "should", "these", "those", "into", "through",
            "during", "before", "after", "above", "below", "between", "under"
          ].includes(word)
        )
        .slice(0, 10);

      console.log("Education Description Keywords:", descriptionKeywords);

      // Get professional summary keywords
      const professionalSummary = resumeInfo?.summary || "";
      const summaryKeywords = professionalSummary
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => 
          word.length > 3 && 
          ![
            "the", "and", "with", "using", "worked", "have", "been", "this",
            "that", "from", "were", "which", "their", "about", "would",
            "there", "could", "should", "these", "those", "into", "through"
          ].includes(word)
        )
        .slice(0, 15);

      console.log("Professional Summary Keywords:", summaryKeywords);

      // Get user's skills
      const userSkills = resumeInfo?.skills?.map(skill => skill.name).join(", ") || "";
      console.log("User Skills:", userSkills);

      // Combine keywords with priority: description input > professional summary > skills
      const combinedKeywords = [
        ...descriptionKeywords,
        ...summaryKeywords,
        ...userSkills.toLowerCase().split(/[,\s]+/).filter(w => w.length > 2)
      ].filter(Boolean).slice(0, 25).join(", ");

      console.log("Combined Keywords for Education:", combinedKeywords);

      const prompt = `
Generate 3-4 concise bullet points for an education description on a resume. Each bullet point should be SHORT (1-2 lines max) and professionally describe relevant coursework, academic achievements, or skills learned.

Education Details:
- University: ${currentEducation.universityName || "Not provided"}
- Degree: ${currentEducation.degree || "Not provided"}
- Major: ${currentEducation.major || "Not provided"}
- Grade: ${currentEducation.grade ? `${currentEducation.grade} ${currentEducation.gradeType}` : "Not provided"}
- Current Description Input: ${currentDescription || "None"}

${combinedKeywords ? `Relevant Context/Keywords: ${combinedKeywords}` : ""}
${userSkills ? `User's Technical Skills: ${userSkills}` : ""}

Keep it concise and impactful. Focus on:
- Relevant coursework related to the user's skills/career goals
- Academic achievements or honors
- Key projects or research
- Technical skills or tools learned

Return ONLY a pure JSON object in this exact format (no markdown, no code blocks):
{
  "summary": "<ul><li>First bullet point (1-2 lines)</li><li>Second bullet point (1-2 lines)</li><li>Third bullet point (1-2 lines)</li></ul>"
}

Example format (3 points, each 1-2 lines):
{
  "summary": "<ul><li>Completed advanced coursework in Data Structures, Algorithms, and Machine Learning with distinction</li><li>Led team project developing full-stack web application using React and Node.js, achieving 95% grade</li><li>Received Dean's List recognition for maintaining 3.8+ GPA across all semesters</li></ul>"
}
`;

      console.log("AI Prompt for Education:", prompt);

      const result = await AIChatSession.sendMessage(prompt);
      const responseText = await result.response.text();
      
      console.log("Raw AI Response for Education:", responseText);

      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      console.log("Cleaned AI Response:", cleanedResponse);

      // Extract JSON if it's wrapped in other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const parsedResponse = JSON.parse(cleanedResponse);
      console.log("Parsed AI Response:", parsedResponse);

      if (parsedResponse?.summary) {
        // Convert HTML to plain text with bullet points
        const htmlString = parsedResponse.summary;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        
        // Extract text from <li> elements and add bullet points
        const listItems = tempDiv.querySelectorAll('li');
        const plainTextBullets = Array.from(listItems)
          .map(li => `• ${li.textContent.trim()}`)
          .join('\n');
        
        console.log("Converted to plain text bullets:", plainTextBullets);

        const list = [...educationalList];
        list[index] = {
          ...list[index],
          description: plainTextBullets,
        };
        setEducationalList(list);
        toast.success("Description generated successfully!");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add Your educational details</p>

      <div>
        {educationalList.map((item, index) => (
          <div key={index}>
            <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
              <div className="col-span-2">
                <label>University Name</label>
                <Input
                  name="universityName"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.universityName || ""}
                />
              </div>
              <div>
                <label>Degree</label>
                <Input
                  name="degree"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.degree || ""}
                />
              </div>
              <div>
                <label>Major</label>
                <Input
                  name="major"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.major || ""}
                />
              </div>
              <div>
                <label>Start Date</label>
                <Input
                  type="month"
                  name="startDate"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.startDate || ""}
                />
              </div>
              <div>
                <label>End Date</label>
                <Input
                  type="month"
                  name="endDate"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.endDate || ""}
                />
              </div>
              <div className="col-span-2">
                <label>Grade</label>
                <div className="flex justify-center items-center gap-4">
                  <select
                    name="gradeType"
                    className="py-2 px-4 rounded-md"
                    onChange={(e) => handleChange(e, index)}
                    value={item?.gradeType || "CGPA"}
                  >
                    <option value="CGPA">CGPA</option>
                    <option value="GPA">GPA</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                  <Input
                    type="text"
                    name="grade"
                    onChange={(e) => handleChange(e, index)}
                    value={item?.grade || ""}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label>Description</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary flex gap-2"
                    type="button"
                    disabled={aiLoading[index]}
                    onClick={() => GenerateDescriptionFromAI(index)}
                  >
                    {aiLoading[index] ? (
                      <>
                        <LoaderCircle className="animate-spin" size={16} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        Generate from AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  name="description"
                  onChange={(e) => handleChange(e, index)}
                  value={item?.description || ""}
                  placeholder="Add relevant coursework, achievements, or skills learned..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={AddNewEducation}
            className="text-primary"
          >
            {" "}
            + Add More Education
          </Button>
          <Button
            variant="outline"
            onClick={RemoveEducation}
            className="text-primary"
          >
            {" "}
            - Remove
          </Button>
        </div>
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default Education;
