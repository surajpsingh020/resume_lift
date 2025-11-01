import React from "react";
import { formatMonthYear } from "@/lib/utils";

function ExperiencePreview({ resumeInfo }) {
  const handleLinkClick = (e) => {
    console.log('Click detected on:', e.target.tagName, e.target);
    
    // Check if the clicked element or its parent is a link
    let target = e.target;
    while (target && target !== e.currentTarget) {
      if (target.tagName === 'A') {
        e.preventDefault();
        e.stopPropagation();
        const href = target.getAttribute('href');
        console.log('Link clicked! href:', href);
        if (href) {
          // Ensure href has protocol
          const fullHref = href.startsWith('http') ? href : `https://${href}`;
          console.log('Opening URL:', fullHref);
          window.open(fullHref, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      target = target.parentElement;
    }
  };

  return (
    <div className="my-6" onClick={handleLinkClick}>
      {resumeInfo?.experience.length > 0 && (
        <div>
          <h2
            className="text-center font-bold text-sm mb-2"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            Professional Experience
          </h2>
          <hr
            style={{
              borderColor: resumeInfo?.themeColor,
            }}
          />
        </div>
      )}

      {resumeInfo?.experience?.map((experience, index) => (
        <div key={index} className="my-5">
          <h2
            className="text-sm font-bold"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            {experience?.title}
          </h2>
          <h2 className="text-xs flex justify-between">
            {experience?.companyName}
            {experience?.companyName && experience?.city ? ", " : null}
            {experience?.city}
            {experience?.city && experience?.state ? ", " : null}
            {experience?.state}
            <span>
              {formatMonthYear(experience?.startDate)}{" "}
              {experience?.startDate && experience?.currentlyWorking
                ? "- Present"
                : experience.endDate
                ? "-"
                : null}{" "}
              {experience?.currentlyWorking ? "" : formatMonthYear(experience.endDate)}{" "}
            </span>
          </h2>
          {/* <p className='text-xs my-2'>
                    {experience.workSummary}
                </p> */}
          <div
            className="text-xs my-2 experience-content"
            dangerouslySetInnerHTML={{ __html: experience?.workSummary }}
          />
        </div>
      ))}
    </div>
  );
}

export default ExperiencePreview;
