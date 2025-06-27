import { useParams } from 'react-router-dom';

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
  // Fetch project by ID
    return (
    <div className="p-6">
        <h2 className="text-xl font-bold">Project #{projectId}</h2>
    </div>
    );
};

export default ProjectDetailsPage;