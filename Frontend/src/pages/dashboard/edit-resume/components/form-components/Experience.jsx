import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/custom/RichTextEditor";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { updateResumeData } from "@/Services/GlobalApi";
import { updateThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";

const formFields = {
  title: "",
  companyName: "",
  city: "",
  state: "",
  startDate: "",
  endDate: "",
  currentlyWorking: "",
  workSummary: "",
};
function Experience({ resumeInfo, enabledNext, enabledPrev }) {
  const [experienceList, setExperienceList] = React.useState(
    resumeInfo?.experience || []
  );
  const [loading, setLoading] = React.useState(false);
  const { resume_id } = useParams();

  const dispatch = useDispatch();

  // Removed automatic useEffect dispatch to prevent conflicts
  // Now dispatching directly in handlers for immediate updates

  const addExperience = () => {
    if (!experienceList) {
      setExperienceList([formFields]);
      return;
    }
    setExperienceList([...experienceList, formFields]);
  };

  const removeExperience = (index) => {
    const list = [...experienceList];
    const newList = list.filter((item, i) => {
      if (i !== index) return true;
    });
    setExperienceList(newList);
  };

  const handleChange = (e, index) => {
    enabledNext(false);
    enabledPrev(false);
    const { name, value } = e.target;
    const list = [...experienceList];
    const newListData = {
      ...list[index],
      [name]: value,
    };
    list[index] = newListData;
    setExperienceList(list);
    // Immediately dispatch to Redux for preview update
    dispatch(addResumeData({ ...resumeInfo, experience: list }));
  };

  const handleRichTextEditor = (value, name, index) => {
    console.log('=== Experience handleRichTextEditor ===');
    console.log('Index:', index, 'Name:', name);
    console.log('Value preview:', value?.substring(0, 100));
    enabledNext(false);
    enabledPrev(false);
    const list = [...experienceList];
    const newListData = {
      ...list[index],
      [name]: value,
    };
    list[index] = newListData;
    console.log('Updated experience list:', list[index]);
    setExperienceList(list);
    // Immediately dispatch to Redux for preview update
    dispatch(addResumeData({ ...resumeInfo, experience: list }));
    console.log('Dispatched to Redux');
  };

  const onSave = () => {
    setLoading(true);
    const data = {
      data: {
        experience: experienceList,
      },
    };
    if (resume_id) {
      console.log("Started Updating Experience");
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
  };
  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Experience</h2>
        <p>Add Your Previous Job Experience</p>
        <div>
          {experienceList?.map((experience, index) => (
            <div key={index}>
              <div className="flex justify-between my-2">
                <h3 className="font-bold text-lg">Experience {index + 1}</h3>
                <Button
                  variant="outline"
                  className="text-red-500"
                  onClick={(e) => {
                    removeExperience(index);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                <div>
                  <label className="text-xs">Position Tittle</label>
                  <Input
                    type="text"
                    name="title"
                    value={experience?.title}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">Company Name</label>
                  <Input
                    type="text"
                    name="companyName"
                    value={experience?.companyName}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">City</label>
                  <Input
                    type="text"
                    name="city"
                    value={experience?.city}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">State</label>
                  <Input
                    type="text"
                    name="state"
                    value={experience?.state}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">StartDate</label>
                  <Input
                    type="month"
                    name="startDate"
                    value={experience?.startDate}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs">End Date</label>
                  <Input
                    type="month"
                    name="endDate"
                    value={experience?.endDate}
                    onChange={(e) => {
                      handleChange(e, index);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <RichTextEditor
                    index={index}
                    onRichTextEditorChange={(newValue) =>
                      handleRichTextEditor(newValue, "workSummary", index)
                    }
                    resumeInfo={resumeInfo}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-2">
          <Button
            onClick={addExperience}
            variant="outline"
            className="text-primary"
          >
            + Add {resumeInfo?.experience?.length > 0 ? "more" : null}{" "}
            Experience
          </Button>
          <Button onClick={onSave}>
            {loading ? <LoaderCircle className=" animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Experience;
