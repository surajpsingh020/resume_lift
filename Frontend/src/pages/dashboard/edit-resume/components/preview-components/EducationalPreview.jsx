import React, { useEffect, useRef } from "react";
import { formatMonthYear } from "@/lib/utils";

function EducationalPreview({ resumeInfo }) {
  const descriptionRefs = useRef([]);

  // Convert plain text bullets to HTML
  const formatDescription = (description) => {
    if (!description) return "";
    
    console.log("Education Description Input:", description);
    
    // If already contains HTML tags, return as is
    if (description.includes("<ul>") || description.includes("<li>")) {
      console.log("Already has HTML tags, returning as is");
      return description;
    }
    
    // Split by newlines and convert bullet points to HTML list
    const lines = description.split('\n').filter(line => line.trim());
    console.log("Lines after split:", lines);
    
    if (lines.length === 0) return description;
    
    // Check if lines start with bullet points (including Unicode bullet •)
    const hasBullets = lines.some(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
    });
    
    console.log("Has bullets:", hasBullets);
    
    if (hasBullets) {
      const listItems = lines
        .map(line => {
          // Remove bullet point (•, -, or *) and any following whitespace
          const text = line.replace(/^[•\-\*]\s*/, '').trim();
          return text ? `<li>${text}</li>` : '';
        })
        .filter(Boolean)
        .join('');
      const htmlResult = `<ul>${listItems}</ul>`;
      console.log("Converted to HTML:", htmlResult);
      return htmlResult;
    }
    
    // Return plain text as is
    console.log("No bullets found, returning plain text");
    return description;
  };

  useEffect(() => {
    // Add click handlers for links in descriptions
    descriptionRefs.current.forEach((ref) => {
      if (ref) {
        const links = ref.querySelectorAll("a");
        links.forEach((link) => {
          link.addEventListener("click", handleLinkClick);
        });
      }
    });

    return () => {
      descriptionRefs.current.forEach((ref) => {
        if (ref) {
          const links = ref.querySelectorAll("a");
          links.forEach((link) => {
            link.removeEventListener("click", handleLinkClick);
          });
        }
      });
    };
  }, [resumeInfo?.education]);

  const handleLinkClick = (e) => {
    e.preventDefault();
    const href = e.target.getAttribute("href");
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="my-6">
      {resumeInfo?.education.length > 0 && (
        <div>
          <h2
            className="text-center font-bold text-sm mb-2"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            Education
          </h2>
          <hr
            style={{
              borderColor: resumeInfo?.themeColor,
            }}
          />
        </div>
      )}

      {resumeInfo?.education.map((education, index) => (
        <div key={index} className="my-5">
          <h2
            className="text-sm font-bold"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            {education.universityName}
          </h2>
          <h2 className="text-xs flex justify-between">
            {education?.degree}
            {education?.degree && education?.major ? " in " : null}
            {education?.major}
            <span>
              {formatMonthYear(education?.startDate)}{" "}
              {education?.startDate && education?.endDate ? " - " : null}{" "}
              {formatMonthYear(education?.endDate)}
            </span>
          </h2>
          <div className="text-xs">
            {education?.grade ? `${education?.gradeType} - ${education?.grade}` : null}
          </div>
          <div
            className="text-xs my-2 education-content"
            dangerouslySetInnerHTML={{ __html: formatDescription(education?.description) }}
            ref={(el) => (descriptionRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  );
}

export default EducationalPreview;
