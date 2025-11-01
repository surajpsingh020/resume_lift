import React from "react";

function ProjectPreview({ resumeInfo }) {
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
      {resumeInfo?.projects.length > 0 && (
        <div>
          <h2
            className="text-center font-bold text-sm mb-2"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            Personal Project
          </h2>
          <hr
            style={{
              borderColor: resumeInfo?.themeColor,
            }}
          />
        </div>
      )}

      {resumeInfo?.projects?.map((project, index) => (
        <div key={index} className="my-5">
          <h2
            className="text-sm font-bold"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            {project?.projectName}
          </h2>
          <h2 className="text-xs flex justify-between">
            {project?.techStack?.length > 0 && (
              <span>Tech Stack: {project?.techStack?.split(",").join(" | ")}</span>
            )}
          </h2>
          <div
            className="text-xs my-2 project-content"
            dangerouslySetInnerHTML={{ __html: project?.projectSummary }}
          />
        </div>
      ))}
    </div>
  );
}

export default ProjectPreview;
